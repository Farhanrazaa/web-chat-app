import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './ChatList.css'; 

function getStatusClass(status) {
    if (status === 'Active Now' || status === 'Online') {
        return 'online';
    }
    return 'offline'; 
}

function ContactList({ contacts, onSelectContact }) {
    
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
                {sortedContacts.map(contact => (
                    <div
                        key={contact.id}
                        className="chat-list-item"
                        onClick={() => onSelectContact(contact)} // <-- THIS IS THE FIX (pass whole 'contact' object)
                    >
                        <div className="chat-avatar-container">
                            <img src={contact.avatar} alt={contact.name} className="chat-avatar" />
                            <span className={`status-indicator ${getStatusClass(contact.status)}`}></span>
                        </div>
                        
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