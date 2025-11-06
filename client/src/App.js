import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import ProfileInfo from './components/ProfileInfo';
import ContactList from './components/ContactList';
import { FaComments } from 'react-icons/fa'; // Icon for fallback
import './App.css'; // We already styled this


// Connect to your Node.js backend server (running on port 5000)
const socket = io('http://localhost:5000');

function App() {
    // State to hold the list of users/chats
    const [chats, setChats] = useState([]);
    // State to hold the ID of the currently selected chat
    const [selectedChatId, setSelectedChatId] = useState(null);
    // State to hold all messages for the selected chat
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('inbox'); // 'inbox' or 'contacts'

    // This is a hardcoded "current user" for sending messages.
    // In a real app, this would come from a login system.
    const currentUser = {
        id: 'currentUser123',
        name: 'Alexa',
        avatar: 'https://i.pravatar.cc/150?img=10' // A different avatar
    };

    // --- Effects ---

    // 1. Fetch the list of chat users when the app loads
    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => setChats(data))
            .catch(error => console.error('Error fetching users:', error));
    }, []); // The empty array [] means this runs only once

    // 2. Set up WebSocket listeners
    useEffect(() => {
        const handleReceiveMessage = (message) => {

            // --- ADD THIS FIX ---
            // If the incoming message's senderId is us, ignore it.
            if (message.senderId === currentUser.id) {
                return;
            }
            // --- END OF FIX ---

            // Only add the message if it belongs to the currently open chat
            if (message.roomId === selectedChatId) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        };
        socket.on('receive_message', handleReceiveMessage);

        // Clean up the listener when the component unmounts
        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [selectedChatId]); // Re-run this effect if selectedChatId changes


    // --- Helper Functions ---

    // Called when a user clicks on a chat in the ChatList
    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
        setMessages([]);
        socket.emit('join_room', chatId);
        setView('inbox'); // <-- ADD THIS LINE to switch back to chat
    };


    // Called when the user sends a message from ChatWindow
    const handleSendMessage = (messageContent) => {
        if (!selectedChatId || !messageContent.trim()) return;

        const newMessage = {
            roomId: selectedChatId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            content: messageContent,
            timestamp: new Date().toISOString(),
            avatar: currentUser.avatar,
        };

        // Send the message to the server
        socket.emit('send_message', newMessage);

        // Optimistically add the message to our own UI
        // We add an 'isSender' flag just for styling
        setMessages((prevMessages) => [...prevMessages, { ...newMessage, isSender: true }]);
    };

    // Find the full chat object for the selected chat
    const selectedChat = chats.find(chat => chat.id === selectedChatId);

    return (
        <div className="app-container">
            <Sidebar currentView={view} onSetView={setView} />

            {/* --- Conditional List Area --- */}
            {view === 'inbox' ? (
                <ChatList
                    chats={chats}
                    onSelectChat={handleSelectChat}
                    selectedChatId={selectedChatId}
                />
            ) : (
                <ContactList
                    contacts={chats} // Pass all users as contacts
                    onSelectContact={handleSelectChat} // Re-use the same function!
                />
            )}

            {/* --- Main Content Area --- */}
            {selectedChat ? (
                <>
                    <ChatWindow
                        key={selectedChat.id} // Ensures component remounts on chat change
                        chat={selectedChat}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        currentUser={currentUser}
                    />
                    <ProfileInfo user={selectedChat} />
                </>
            ) : (
                <div className="no-chat-selected">
                    <FaComments className="no-chat-selected-icon" />
                    <p>Select a chat to start messaging</p>
                </div>
            )}
        </div>
    );
}

export default App;