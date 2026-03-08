import { useState } from "react";
import Card from "./ui/Card";
import { userProfile } from "../data/mockData";

export default function UserProfileScreen({ onNavigate, onFeedback }) {
  const [name, setName] = useState(userProfile.name);
  const [surname, setSurname] = useState(userProfile.surname);
  const [email, setEmail] = useState("giuseppe.s@unito.it");
  const [phone, setPhone] = useState("+39 345 678 9012");
  const [campus, setCampus] = useState(userProfile.campus);
  const [home, setHome] = useState(userProfile.home);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      onFeedback("Profile photo updated!");
    }
  };

  const handleSave = () => {
    onFeedback("Profile info saved successfully!");
  };

  return (
    <>
      <header className="header-gradient compact">
        <button className="icon-btn" onClick={() => onNavigate("home")}>{"\u2190"}</button>
        <div className="brand"><span>{"\u{1F464}"}</span><span>My Profile</span></div>
        <button className="icon-btn" onClick={handleSave}>{"\u2714"}</button>
      </header>

      {/* Avatar Upload */}
      <div className="uprof-avatar-section">
        <label className="uprof-avatar-wrap" tabIndex={0}>
          {avatarPreview ? (
            <img src={avatarPreview} alt="Profile" className="uprof-avatar-img" />
          ) : (
            <div className="uprof-avatar-placeholder">
              {userProfile.name[0]}{userProfile.surname[0]}
            </div>
          )}
          <span className="uprof-avatar-badge">{"\u{1F4F7}"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="uprof-file-input"
          />
        </label>
        <h3 className="uprof-name">{name} {surname}</h3>
        <p className="muted">{userProfile.role} {"\u2022"} {userProfile.university}</p>
      </div>

      {/* Personal Info */}
      <Card title={"\u{1F4DD} Personal Information"}>
        <div className="uprof-form">
          <div className="uprof-field">
            <label>First Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="uprof-field">
            <label>Last Name</label>
            <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} />
          </div>
          <div className="uprof-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="uprof-field">
            <label>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Commute Info */}
      <Card title={"\u{1F3E0} Commute Details"}>
        <div className="uprof-form">
          <div className="uprof-field">
            <label>Home Address</label>
            <input type="text" value={home} onChange={(e) => setHome(e.target.value)} />
          </div>
          <div className="uprof-field">
            <label>Campus / Workplace</label>
            <input type="text" value={campus} onChange={(e) => setCampus(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card title={"\u{1F4CA} My Stats"}>
        <div className="user-stats">
          <div><strong>{userProfile.totalTrips}</strong><span>Trips</span></div>
          <div><strong>{userProfile.greenScore}</strong><span>Points</span></div>
          <div><strong>{userProfile.totalCO2Saved} kg</strong><span>CO{"\u2082"} Saved</span></div>
          <div><strong>{"\u20AC"}{userProfile.monthlySpend}</strong><span>Monthly</span></div>
        </div>
      </Card>

      {/* Segment Badge */}
      <Card title={"\u{1F9EC} Your Segment"}>
        <div className="uprof-segment">
          <span className="segment-tag lg">{"\u{1F9EC}"} {userProfile.segment}</span>
          <p className="muted">Based on your travel patterns and behavioural profile, the RL engine classifies you as a <strong>{userProfile.segment}</strong>.</p>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="uprof-actions">
          <button className="btn solid full" onClick={handleSave}>
            Save Changes {"\u2714"}
          </button>
          <button className="btn ghost full" onClick={() => onFeedback("Password reset email sent!")}>
            Change Password
          </button>
          <button className="btn ghost full danger" onClick={() => onFeedback("Account deletion requested")}>
            Delete Account
          </button>
        </div>
      </Card>
    </>
  );
}
