import React from 'react';
import './ChatList.css'; 
import { FaSearch } from 'react-icons/fa';

function getStatusClass(status) {
    if (status === 'Active Now' || status === 'Online') {
        return 'online';
    }
    return 'offline'; 
}

// --- NEW: Helper function to format the time ---
function formatChatTime(timestamp) {
    if (!timestamp) return ''; // No message yet
    
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ChatList({ chats, onSelectChat, selectedChatId }) {
    return (
        <div className="chat-list-container">
            <div className="chat-list-header">
                <h2>inbox</h2>
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Search in your inbox" />
                </div>
            </div>
            
            <div className="chat-list-items">
                {/* 'chats' is now the new combined/sorted list */}
                {chats.map(chat => (
                    <div
                        key={chat.id}
                        className={`chat-list-item ${selectedChatId === chat.id ? 'active' : ''}`}
                        onClick={() => onSelectChat(chat)}
                    >
                        <div className="chat-avatar-container">
                            <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
                            <span className={`status-indicator ${getStatusClass(chat.status)}`}></span>
                        </div>
                        
                        <div className="chat-info">
                            <div className="chat-name-and-time">
                                <span className="chat-name">{chat.name}</span>
                                {/* --- UPDATED: Show real time --- */}
                                <span className="chat-time">{formatChatTime(chat.timestamp)}</span> 
                            </div>
                            <div className="chat-last-message">
                                {/* --- UPDATED: Show real message --- */}
                                <p>{chat.lastMessage}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatList;