# LinkedIn Post — MoveWise Repository Launch

## Post Text (copy below)

---

Excited to share MoveWise, an open-source project I built with Sajjad Shahali and Kiana Salimi at Politecnico di Torino for the NEXUS 2026 Hackathon, supervised by Prof. Cristina Pronello.

MoveWise is a Mobility-as-a-Service (MaaS) platform. The core idea: most people stick with their cars not because it is the best option, but because comparing alternatives is too complicated. We wanted to change that.

How it works under the hood:

The back-end runs a Reinforcement Learning engine in Python. It models each user's travel behavior as a Markov Decision Process, where the agent learns which combination of transport modes (bus, train, e-scooter, bike, carpool) minimizes travel time, cost, and CO₂ for that specific user. The RL agent uses a reward function that balances three objectives: user satisfaction, monetary savings, and emission reduction. Over time, it adapts to individual habits and preferences.

On the front-end, we built a React app with Vite, integrated with Leaflet/OpenStreetMap for real-time route visualization. Users can see multimodal journey options ranked by the RL engine, compare true costs (not just fuel, but insurance, depreciation, parking, time), and pay across all transport modes with a single QR code.

The platform also includes a True Cost Calculator that reveals the full monthly cost of car ownership. Most drivers think they spend around €60/month (just fuel). The actual figure, when you include insurance, depreciation, maintenance, parking, and time value, is closer to €510/month. Showing this gap is one of the strongest nudges toward modal shift.

We set up a full CI/CD pipeline with GitHub Actions for automated testing and deployment. The live demo runs on GitHub Pages.

The project was developed as part of Prof. Pronello's Intelligent Transportation Systems course, which provided the academic framework for approaching urban mobility challenges.

Full source code, live demo, and interactive presentation:
https://github.com/aliivaezii/RL-Mobility-Optimizer

#MobilityAsAService #MaaS #ReinforcementLearning #SustainableMobility #OpenSource #React #Python #UrbanTransport #SmartCities #PolitecnicodiTorino #NEXUS2026 #AI #MachineLearning #GreenTransport

---

## Images to Upload (in order)

Upload these as a LinkedIn carousel or as multiple images in the post:

| Order | File | Description |
|-------|------|-------------|
| 1 | `1_logo.jpg` | MoveWise logo (use as cover/first image) |
| 2 | `2_app_home.png` | App home screen showing dashboard |
| 3 | `3_app_route_planner.png` | Route planner with multimodal options |
| 4 | `4_app_map.png` | Interactive map with live tracking |
| 5 | `5_app_carpooling.png` | Carpooling feature |
| 6 | `6_app_payment.png` | QR-based unified payment system |

## Tips

- Tag the people: @Cristina Pronello, @Sajjad Shahali, @Kiana Salimi
- Tag the institution: @Politecnico di Torino
- Best time to post: Tuesday or Wednesday, 8-10 AM CET
- Add the live demo link in the first comment for better reach:
  https://aliivaezii.github.io/RL-Mobility-Optimizer/
