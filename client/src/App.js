// --- 1. ALL IMPORTS MUST BE FIRST ---
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import ProfileInfo from './components/ProfileInfo';
import ContactList from './components/ContactList';
import { FaComments } from 'react-icons/fa';
import './App.css';

// --- 2. PASTE YOUR RENDER URL HERE (AFTER IMPORTS) ---
const BACKEND_URL = 'https://my-chat-backend-97lf.onrender.com';

// --- 3. CONNECT SOCKET TO LIVE URL ---
const socket = io(BACKEND_URL);

function App() {
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('inbox');

    const currentUser = { 
        id: 'currentUser123', 
        name: 'Alexa', 
        avatar: 'https://i.pravatar.cc/150?img=10'
    };

    // --- 4. FETCH USERS FROM LIVE URL ---
    useEffect(() => {
        fetch(`${BACKEND_URL}/api/users`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => setChats(data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    useEffect(() => {
        const handleReceiveMessage = (message) => {
            if (message.senderId === currentUser.id) {
                return;
            }
            if (message.roomId === selectedChatId) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [selectedChatId, currentUser.id]);

    
    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
        setMessages([]); 
        socket.emit('join_room', chatId);
        setView('inbox');
    };

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
        
        socket.emit('send_message', newMessage);
        setMessages((prevMessages) => [...prevMessages, { ...newMessage, isSender: true }]);
    };

    const selectedChat = chats.find(chat => chat.id === selectedChatId);

    return (
        <div className="app-container">
            <Sidebar currentView={view} onSetView={setView} />
            
            {view === 'inbox' ? (
                <ChatList
                    chats={chats}
                    onSelectChat={handleSelectChat}
                    selectedChatId={selectedChatId}
                />
            ) : (
                <ContactList
                    contacts={chats}
                    onSelectContact={handleSelectChat}
                />
            )}

            {selectedChat ? (
                <>
                    <ChatWindow
                        key={selectedChat.id}
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