import React from 'react';
import './ProfileInfo.css';
import { FaFileAlt, FaImage, FaMicrophone, FaStar } from 'react-icons/fa'; // <-- Import FaStar

// Placeholder images for attachments
const img1 = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100";
const img2 = "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100";
const img3 = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100";
const img4 = "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100";

// --- Receive new props: onToggleFavorite and isFavorite ---
function ProfileInfo({ user, onToggleFavorite, isFavorite }) {
    if (!user) {
        return null;
    }

    return (
        <div className="profile-info-container">
            <div className="profile-header">
                <h3>Profile Info</h3>
            </div>

            {/* --- User Details --- */}
            <div className="profile-card">
                <img src={user.avatar} alt={user.name} className="profile-avatar-large" />
                
                {/* --- FAVORITE BUTTON ADDED --- */}
                <div className="profile-name-container">
                    <h4 className="profile-name">{user.name}</h4>
                    <FaStar 
                        className={`favorite-star-icon ${isFavorite ? 'active' : ''}`}
                        onClick={() => onToggleFavorite(user.uid)}
                    />
                </div>
                <span className="profile-status">{user.status || 'Online'}</span>
            </div>

            {/* --- Attachments Section --- */}
            <div className="attachments-section">
                <div className="attachments-header">
                    <h3>Attachment</h3>
                    <span className="attachment-count">15</span>
                </div>

                <div className="attachment-gallery">
                    <img src={img1} alt="attachment" />
                    <img src={img2} alt="attachment" />
                    <img src={img3} alt="attachment" />
                    <img src={img4} alt="attachment" />
                </div>

                <div className="attachment-types">
                    <div className="type-button" style={{ background: '#e7f3ff', color: '#4b9fff' }}>
                        <FaFileAlt />
                    </div>
                    <div className="type-button" style={{ background: '#fff0e9', color: '#ff844b' }}>
                        <FaImage />
                    </div>
                    <div className="type-button" style={{ background: '#e9f9f0', color: '#31d07b' }}>
                        <FaMicrophone />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileInfo;