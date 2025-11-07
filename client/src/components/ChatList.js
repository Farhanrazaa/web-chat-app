import React from 'react';
import './ChatList.css'; // We will create this next
import { FaSearch } from 'react-icons/fa';

// Helper function to format the 'status' text
function getStatusClass(status) {
    if (status === 'Active Now' || status === 'Online') {
        return 'online';
    }
    // You could add 'away', 'offline', etc. here
    return 'offline'; 
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
                {/* Loop over the 'chats' array and create an item for each one */}
                {chats.map(chat => (
                    <div
                        key={chat.id}
                        // Add 'active' class if this chat is the selected one
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
                                {/* Placeholder time - you'd get this from message data */}
                                <span className="chat-time">12:30 PM</span>
                            </div>
                            <div className="chat-last-message">
                                <p>{chat.lastMessage}</p>
                                {/* Placeholder unread count */}
                                {chat.id === '3' && <span className="unread-count">2</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatList;