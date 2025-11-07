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

    // Helper to format the timestamp
    const formatTime = (isoString) => {
        // Handle Firebase serverTimestamp (which might be null on send)
        if (!isoString?.toDate) {
            return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        const date = isoString.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                        key={msg.id} // Use the doc id as the key
                        // --- THIS IS THE FIX ---
                        className={`message-bubble ${msg.isSender || msg.senderId === currentUser.uid ? 'sent' : 'received'}`}
                    >
                        {!(msg.isSender || msg.senderId === currentUser.uid) && (
                            <img src={msg.avatar || chat.avatar} alt="avatar" className="message-avatar" />
                        )}
                        <div className="message-content">
                            <p>{msg.content}</p>
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
                    onChange={(e) => setMessageInput(e.g.target.value)}
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