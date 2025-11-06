import React from 'react';
import './Sidebar.css';
import { FaUser, FaComments, FaStar, FaCog, FaPlus } from 'react-icons/fa';

function Sidebar({ currentView, onSetView }) { 
    // A placeholder avatar for the current user
    const userAvatar = "https://i.pravatar.cc/150?img=10"; // Matches 'Alexa'

    return (
        <div className="sidebar">
            <div className="sidebar-profile">
                <img src={userAvatar} alt="Alexa" />
                <span>Alexa</span>
            </div>
            
            <nav className="sidebar-nav">
                <ul>
                    {/* --- Chat Button --- */}
                    <li 
                        className={currentView === 'inbox' ? 'active' : ''}
                        onClick={() => onSetView('inbox')}
                    >
                        <FaComments />
                        <span>Chat</span>
                    </li>
                    
                    {/* --- Contacts Button --- */}
                    <li
                        className={currentView === 'contacts' ? 'active' : ''}
                        onClick={() => onSetView('contacts')}
                    >
                        <FaUser />
                        <span>Contacts</span>
                    </li>
                    
                    {/* --- Favorites Button (not functional yet) --- */}
                    <li onClick={() => alert('Favorites not yet implemented!')}>
                        <FaStar />
                        <span>Favorites</span>
                    </li>
                </ul>
            </nav>
            
            <div className="sidebar-bottom">
                <FaPlus className="add-icon" />
                <FaCog className="settings-icon" />
            </div>
        </div>
    );
}

export default Sidebar;