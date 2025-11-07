import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css'; // We will create this next
import { FaPaperclip, FaMicrophone, FaEllipsisH, FaSearch } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5'; // A better send icon

function ChatWindow({ chat, messages, onSendMessage, currentUser }) {
    const [messageInput, setMessageInput] = useState('');
    // Create a ref to the message list's end
    const messagesEndRef = useRef(null);

    // Helper function to auto-scroll to the bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // This effect runs every time the 'messages' array changes
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle the form submission (pressing Enter or clicking Send)
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload
        onSendMessage(messageInput);
        setMessageInput(''); // Clear the input field
    };

    // Helper to format the timestamp (e.g., "09:45 PM")
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-window-container">
            {/* --- 1. CHAT HEADER --- */}
            <div className="chat-header">
                <div className="chat-header-info">
                    {/* Avatar is hidden, as per the design */}
                    {/* <img src={chat.avatar} alt={chat.name} className="chat-header-avatar" /> */}
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
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        // Set class to 'sent' or 'received' based on sender
                        // This is the fixed line
                        className={`message-bubble ${msg.isSender || msg.senderId === currentUser.uid ? 'sent' : 'received'}`}
                    >
                        {/* Only show avatar for received messages */}
                        {!(msg.isSender || msg.senderId === currentUser.id) && (
                            <img src={msg.avatar || chat.avatar} alt="avatar" className="message-avatar" />
                        )}
                        <div className="message-content">
                            <p>{msg.content}</p>
                            <span className="message-time">{formatTime(msg.timestamp)}</span>
                        </div>
                    </div>
                ))}
                {/* This empty div is the anchor for auto-scrolling */}
                <div ref={messagesEndRef} />
            </div>

            {/* --- 3. MESSAGE INPUT FORM --- */}
            <form className="chat-input-area" onSubmit={handleSubmit}>
                <FaPaperclip className="input-icon" />
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
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