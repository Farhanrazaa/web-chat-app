import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';
import { FaPaperclip, FaMicrophone, FaEllipsisH, FaSearch } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';

function ChatWindow({ chat, messages, onSendMessage, currentUser }) {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSendMessage(messageInput);
        setMessageInput('');
    };

    // --- THIS IS THE FIXED FUNCTION ---
    const formatTime = (timestamp) => {
        // timestamp from Firebase can be null (on a local write)
        // or it can be a Firebase Timestamp object.
        
        // 1. If timestamp is null or doesn't exist, show a temporary time
        if (!timestamp) {
            return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // 2. Check if it's a Firebase Timestamp and has the toDate method
        if (typeof timestamp.toDate === 'function') {
            const date = timestamp.toDate();
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // 3. Fallback if it's some other format (shouldn't happen)
        return "Invalid Date";
    };

    return (
        <div className="chat-window-container">
            {/* --- 1. CHAT HEADER --- */}
            <div className="chat-header">
                <div className="chat-header-info">
                    <div>
                        <h3>{chat.name}</h3>
                        <span className="chat-header-status">{chat.status}</span>
                    </div>
                </div>
                <div className="chat-header-actions">
                    <FaSearch />
                    <FaPaperclip />
                    <FaEllipsisH />
                </div>
            </div>

            {/* --- 2. MESSAGES LIST --- */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div 
                        key={msg.id}
                        className={`message-bubble ${msg.isSender || msg.senderId === currentUser.uid ? 'sent' : 'received'}`}
                    >
                        {!(msg.isSender || msg.senderId === currentUser.uid) && (
                            <img src={msg.avatar || chat.avatar} alt="avatar" className="message-avatar" />
                        )}
                        <div className="message-content">
                            <p>{msg.content}</p>
                            {/* This will now call the new formatTime function */}
                            <span className="message-time">{formatTime(msg.timestamp)}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* --- 3. MESSAGE INPUT FORM --- */}
            <form className="chat-input-area" onSubmit={handleSubmit}>
                <FaPaperclip className="input-icon" />
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    // --- I ALSO FIXED THE TYPO HERE ---
                    onChange={(e) => setMessageInput(e.target.value)}
                />
                <FaMicrophone className="input-icon" />
                <button type="submit" className="send-button">
                    <IoSend />
                </button>
            </form>
        </div>
    );
}

export default ChatWindow;