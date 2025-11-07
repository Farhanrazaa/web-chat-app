import React, { useState, useEffect, useRef } from 'react';
// --- 1. IMPORT FIREBASE (NEW) ---
import { db } from './firebase';
import { 
  collection, // Used to reference a 'table'
  query,      // Used to build a 'select'
  orderBy,    // Used for sorting
  onSnapshot, // The real-time listener
  addDoc,     // Used to add a new message
  serverTimestamp // Gets the server's time
} from 'firebase/firestore'; 

import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import ProfileInfo from './components/ProfileInfo';
import ContactList from './components/ContactList';
import { FaComments } from 'react-icons/fa';
import './App.css';

// --- 2. NO MORE SOCKET.IO! ---
// const socket = io(BACKEND_URL); // (This is now deleted)

function App() {
    const [chats, setChats] = useState([]); // This would also come from Firebase
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('inbox');

    // We still hardcode a "current user" for this demo
    const currentUser = { 
        id: 'currentUser123', 
        name: 'Alexa', 
        avatar: 'https://i.pravatar.cc/150?img=10'
    };

    // --- 3. FETCH USERS (For this demo, we'll keep it simple) ---
    // In a real app, you'd fetch this user list from Firebase too.
    useEffect(() => {
        const staticUsers = [
            { id: '1', name: 'Jennifer Lisity', status: 'Active Now', avatar: 'https://i.pravatar.cc/150?img=1', lastMessage: "Said one, let. Morning them, said. So were..." },
            { id: '2', name: 'Nancy J. Martinez', status: 'Online', avatar: 'https://i.pravatar.cc/150?img=2', lastMessage: "Hey Jennifer, I just saw your message right now..." },
            { id: '3', name: 'Helen Pool', status: '1h ago', avatar: 'https://i.pravatar.cc/150?img=3', lastMessage: "abundantly be fruitful morning moveth hath..." }
        ];
        setChats(staticUsers);
    }, []);

    // --- 4. REAL-TIME MESSAGE LISTENER (REPLACES socket.on) ---
    useEffect(() => {
        if (!selectedChatId) return; // Don't listen if no chat is selected

        // Create a 'query' to get messages from this chat room, ordered by time
        const q = query(
          collection(db, 'chats', selectedChatId, 'messages'), // Path: /chats/{chatId}/messages
          orderBy('timestamp', 'asc') // Sort by timestamp
        );

        // 'onSnapshot' is the real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newMessages = [];
            querySnapshot.forEach((doc) => {
                newMessages.push({ ...doc.data(), id: doc.id });
            });
            setMessages(newMessages);
        });

        // This 'return' function is cleanup. It runs when the component
        // unmounts or when 'selectedChatId' changes.
        return () => {
          unsubscribe(); // Stop listening to the old chat room
        };
    }, [selectedChatId]); // Re-run this effect when selectedChatId changes


    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
        setMessages([]); // Clear messages while new ones load
        setView('inbox');
    };

    // --- 5. SEND MESSAGE FUNCTION (REPLACES socket.emit) ---
    const handleSendMessage = async (messageContent) => {
        if (!selectedChatId || !messageContent.trim()) return;

        // Create the new message object
        const newMessage = {
            senderId: currentUser.id,
            senderName: currentUser.name,
            content: messageContent,
            avatar: currentUser.avatar,
            timestamp: serverTimestamp() // Use Firebase's server time
        };

        // Add the new message to the database
        // Path: /chats/{chatId}/messages
        await addDoc(collection(db, 'chats', selectedChatId, 'messages'), newMessage);
        
        // We don't need optimistic update (setMessages) anymore, 
        // because the 'onSnapshot' listener will see the new
        // message and update the UI for us!
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