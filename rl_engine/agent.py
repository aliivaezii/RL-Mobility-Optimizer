"""
MoveWise RL Engine — Deep Q-Network Agent
==========================================
Implements the DQN from v3 §7 (based on Mnih et al., 2015):

Main Q-Network:
  Selects compound (route, nudge) actions from state → Q(s, a; θ).
  Double DQN: main net selects action, target net evaluates value.

Nudge Q-Network (v3 Eq. 5):
  Nudge*(i,t) = argmax Q̂_nudge(s_i^t, nudge; θ_nudge)
  Separate smaller network that selects the optimal nudge given
  the current state and the chosen transport mode.

Training:
  - Experience replay buffer (deque, default 10k transitions)
  - Epsilon-greedy exploration with exponential decay
  - Gradient clipping (max norm = 1.0) for stability
  - Periodic target network updates (every 20 episodes)

References:
  Mnih, V. et al. (2015). Human-Level Control through Deep RL. Nature.
  v3 §4 — Nudge selection strategies (Table 3)
"""

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from collections import deque, namedtuple
from typing import Tuple, List, Optional

from .config import RL_CONFIG, NUM_MODES, NUM_NUDGES

# Experience tuple
Experience = namedtuple("Experience", ["state", "action", "reward", "next_state", "done"])


class QNetwork(nn.Module):
    """
    Deep Q-Network.
    Maps state → Q-values for all compound actions (mode × nudge).
    """
    
    def __init__(self, state_dim: int, num_actions: int, hidden_dim: int = 128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, num_actions),
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class NudgeQNetwork(nn.Module):
    """
    Second Q-Network for nudge selection (v3 Eq. 5):
    Nudge*(i,t) = argmax Q̂_nudge(s_i^t, nudge; θ_nudge)
    
    This is a smaller network that only selects the nudge,
    given the state and the chosen route.
    """
    
    def __init__(self, state_dim: int, num_nudges: int, hidden_dim: int = 64):
        super().__init__()
        # Input: state + one-hot mode encoding
        input_dim = state_dim + NUM_MODES
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, num_nudges),
        )
    
    def forward(self, state: torch.Tensor, mode_onehot: torch.Tensor) -> torch.Tensor:
        x = torch.cat([state, mode_onehot], dim=-1)
        return self.net(x)


class ReplayBuffer:
    """Experience replay buffer for DQN training."""
    
    def __init__(self, capacity: int = 10000):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, next_state, done):
        self.buffer.append(Experience(state, action, reward, next_state, done))
    
    def sample(self, batch_size: int) -> List[Experience]:
        indices = np.random.choice(len(self.buffer), batch_size, replace=False)
        return [self.buffer[i] for i in indices]
    
    def __len__(self):
        return len(self.buffer)


class DQNAgent:
    """
    Deep Q-Network agent for MaaS route + nudge recommendation.
    
    Architecture:
      - Main Q-Network: selects compound (route, nudge) actions
      - Target Q-Network: stabilizes training (updated periodically)
      - Replay Buffer: stores experience for batch training
      - Epsilon-greedy: balances exploration/exploitation
    """
    
    def __init__(self, config: Optional[RL_CONFIG.__class__] = None):
        self.config = config or RL_CONFIG
        self.device = torch.device("cpu")  # CPU for portability
        
        # Number of actions
        self.num_actions = NUM_MODES * NUM_NUDGES
        
        # Networks
        self.q_net = QNetwork(
            self.config.state_dim, self.num_actions, self.config.hidden_dim
        ).to(self.device)
        
        self.target_net = QNetwork(
            self.config.state_dim, self.num_actions, self.config.hidden_dim
        ).to(self.device)
        self.target_net.load_state_dict(self.q_net.state_dict())
        self.target_net.eval()
        
        # Nudge agent (second RL agent from v3)
        self.nudge_net = NudgeQNetwork(
            self.config.state_dim, NUM_NUDGES
        ).to(self.device)
        
        # Optimizers
        self.optimizer = optim.Adam(
            self.q_net.parameters(), lr=self.config.learning_rate
        )
        self.nudge_optimizer = optim.Adam(
            self.nudge_net.parameters(), lr=self.config.learning_rate
        )
        
        # Replay buffer
        self.buffer = ReplayBuffer(self.config.buffer_size)
        
        # Exploration
        self.epsilon = self.config.epsilon_start
        
        # Training counters
        self.training_step = 0
        self.episode_count = 0
        
        # Loss tracking
        self.losses = []
    
    def select_action(self, state: np.ndarray, training: bool = True) -> int:
        """
        Select compound action (mode × nudge) using epsilon-greedy.
        
        During training: ε probability of random action.
        During inference: always greedy (best Q-value).
        """
        if training and np.random.random() < self.epsilon:
            return np.random.randint(self.num_actions)
        
        with torch.no_grad():
            state_t = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.q_net(state_t)
            return q_values.argmax(dim=1).item()
    
    def select_nudge(self, state: np.ndarray, mode_idx: int) -> int:
        """
        Select nudge using the dedicated nudge Q-network (v3 Eq. 5).
        """
        with torch.no_grad():
            state_t = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            mode_onehot = torch.zeros(1, NUM_MODES).to(self.device)
            mode_onehot[0, mode_idx] = 1.0
            q_nudge = self.nudge_net(state_t, mode_onehot)
            return q_nudge.argmax(dim=1).item()
    
    def store_experience(self, state, action, reward, next_state, done):
        """Store a transition in the replay buffer."""
        self.buffer.push(state, action, reward, next_state, done)
    
    def train_step(self) -> Optional[float]:
        """
        Perform one training step using a mini-batch from replay buffer.
        Returns the loss value, or None if not enough samples.
        """
        if len(self.buffer) < self.config.batch_size:
            return None
        
        # Sample batch
        batch = self.buffer.sample(self.config.batch_size)
        
        states = torch.FloatTensor(np.array([e.state for e in batch])).to(self.device)
        actions = torch.LongTensor([e.action for e in batch]).to(self.device)
        rewards = torch.FloatTensor([e.reward for e in batch]).to(self.device)
        next_states = torch.FloatTensor(np.array([e.next_state for e in batch])).to(self.device)
        dones = torch.FloatTensor([float(e.done) for e in batch]).to(self.device)
        
        # Current Q-values
        q_values = self.q_net(states).gather(1, actions.unsqueeze(1)).squeeze(1)
        
        # Target Q-values (Double DQN style)
        with torch.no_grad():
            # Use main network to select action
            next_actions = self.q_net(next_states).argmax(dim=1)
            # Use target network to evaluate
            next_q = self.target_net(next_states).gather(1, next_actions.unsqueeze(1)).squeeze(1)
            target_q = rewards + self.config.gamma * next_q * (1 - dones)
        
        # Loss
        loss = nn.MSELoss()(q_values, target_q)
        
        # Optimize
        self.optimizer.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(self.q_net.parameters(), 1.0)  # Gradient clipping
        self.optimizer.step()
        
        self.training_step += 1
        loss_val = loss.item()
        self.losses.append(loss_val)
        
        # Update target network periodically
        if self.training_step % self.config.target_update_freq == 0:
            self.target_net.load_state_dict(self.q_net.state_dict())
        
        return loss_val
    
    def decay_epsilon(self):
        """Decay exploration rate."""
        self.epsilon = max(
            self.config.epsilon_end,
            self.epsilon * self.config.epsilon_decay,
        )
    
    def get_q_values(self, state: np.ndarray) -> np.ndarray:
        """Get Q-values for all actions given a state."""
        with torch.no_grad():
            state_t = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            return self.q_net(state_t).cpu().numpy().flatten()
    
    def save(self, path: str):
        """Save agent weights."""
        torch.save({
            "q_net": self.q_net.state_dict(),
            "target_net": self.target_net.state_dict(),
            "nudge_net": self.nudge_net.state_dict(),
            "optimizer": self.optimizer.state_dict(),
            "epsilon": self.epsilon,
            "training_step": self.training_step,
            "episode_count": self.episode_count,
        }, path)
    
    def load(self, path: str):
        """Load agent weights."""
        checkpoint = torch.load(path, map_location=self.device)
        self.q_net.load_state_dict(checkpoint["q_net"])
        self.target_net.load_state_dict(checkpoint["target_net"])
        self.nudge_net.load_state_dict(checkpoint["nudge_net"])
        self.optimizer.load_state_dict(checkpoint["optimizer"])
        self.epsilon = checkpoint["epsilon"]
        self.training_step = checkpoint["training_step"]
        self.episode_count = checkpoint["episode_count"]
