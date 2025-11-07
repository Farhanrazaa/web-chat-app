import React from 'react';
import { FaSearch } from 'react-icons/fa';
// We import ChatList.css to re-use its styles!
import './ChatList.css'; 

// Helper function to get the status class
function getStatusClass(status) {
    if (status === 'Active Now' || status === 'Online') {
        return 'online';
    }
    return 'offline'; 
}

function ContactList({ contacts, onSelectContact }) {

    // Sort contacts alphabetically
    const sortedContacts = [...contacts].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="chat-list-container">
            <div className="chat-list-header">
                <h2>Contacts</h2>
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Search contacts" />
                </div>
            </div>

            <div className="chat-list-items">
                {/* Loop over the sorted contacts array */}
                {sortedContacts.map(contact => (
                    <div
                        key={contact.id}
                        className="chat-list-item"
                        onClick={() => onSelectContact(contact)}
                    >
                        <div className="chat-avatar-container">
                            <img src={contact.avatar} alt={contact.name} className="chat-avatar" />
                            <span className={`status-indicator ${getStatusClass(contact.status)}`}></span>
                        </div>

                        {/* We just show name and status, no last message */}
                        <div className="chat-info">
                            <span className="chat-name">{contact.name}</span>
                            <div className="chat-last-message">
                                <p>{contact.status}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ContactList;