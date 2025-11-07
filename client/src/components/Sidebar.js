import React from 'react';
import './Sidebar.css';
import { FaUser, FaComments, FaStar, FaCog, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function Sidebar({ user, currentView, onSetView }) {

    const handleLogout = () => {
        signOut(auth).catch((err) => console.error(err));
    };

    const userName = user ? user.email.split('@')[0] : 'Alexa';

    return (
        <div className="sidebar">
            <div className="sidebar-profile">
                <img src={`https://i.pravatar.cc/150?u=${user.uid}`} alt={userName} />
                <span>{userName}</span>
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
                    
                    {/* --- FAVORITES BUTTON (Now functional) --- */}
                    <li
                        className={currentView === 'favorites' ? 'active' : ''}
                        onClick={() => onSetView('favorites')}
                    >
                        <FaStar />
                        <span>Favorites</span>
                    </li>
                </ul>
            </nav>
            
            <div className="sidebar-bottom">
                <FaPlus className="add-icon" />
                <FaCog className="settings-icon" />
                <FaSignOutAlt className="logout-icon" onClick={handleLogout} />
            </div>
        </div>
    );
}

export default Sidebar;