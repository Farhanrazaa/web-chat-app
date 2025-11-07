import React from 'react';
import './Sidebar.css';
import { FaUser, FaComments, FaStar, FaCog, FaPlus, FaSignOutAlt } from 'react-icons/fa'; // <-- Add FaSignOutAlt
import { auth } from '../firebase'; // <-- 1. IMPORT AUTH
import { signOut } from 'firebase/auth'; // <-- 2. IMPORT SIGNOUT

function Sidebar({ user, currentView, onSetView }) { // <-- We get the 'user' prop

    // 3. CREATE LOGOUT FUNCTION
    const handleLogout = () => {
        signOut(auth).catch((err) => console.error(err));
    };

    // Use the user's email for their avatar/name
    const userName = user ? user.email.split('@')[0] : 'Alexa';

    return (
        <div className="sidebar">
            <div className="sidebar-profile">
                <img src="https://i.pravatar.cc/150?img=10" alt={userName} />
                <span>{userName}</span>
            </div>
            
            <nav className="sidebar-nav">
                {/* ... (your nav list items are the same) ... */}
                <ul>
                    <li 
                        className={currentView === 'inbox' ? 'active' : ''}
                        onClick={() => onSetView('inbox')}
                    >
                        <FaComments />
                        <span>Chat</span>
                    </li>
                    <li
                        className={currentView === 'contacts' ? 'active' : ''}
                        onClick={() => onSetView('contacts')}
                    >
                        <FaUser />
                        <span>Contacts</span>
                    </li>
                    <li onClick={() => alert('Favorites not yet implemented!')}>
                        <FaStar />
                        <span>Favorites</span>
                    </li>
                </ul>
            </nav>
            
            <div className="sidebar-bottom">
                <FaPlus className="add-icon" />
                <FaCog className="settings-icon" />
                {/* --- 4. ADD THE LOGOUT BUTTON --- */}
                <FaSignOutAlt className="logout-icon" onClick={handleLogout} />
            </div>
        </div>
    );
}

export default Sidebar;