import React, { useState, useEffect } from 'react';
// --- 1. IMPORT AUTH AND NEW HOOK ---
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { 
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'; 

// --- 2. IMPORT LOGIN/SIGNUP COMPONENTS ---
import Login from './components/Login';
import SignUp from './components/SignUp';

import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import ProfileInfo from './components/ProfileInfo';
import ContactList from './components/ContactList';
import { FaComments } from 'react-icons/fa'; // <-- HERE IS THE FIX
import './App.css';

function App() {
    // --- 3. NEW STATE ---
    const [user, setUser] = useState(null); // Will hold the auth'd user
    const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
    const [loading, setLoading] = useState(true); // For initial auth check

    const [chats, setChats] = useState([]); 
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('inbox');

    // --- 4. AUTHENTICATION LISTENER ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                // User is signed in
                setUser(authUser);
            } else {
                // User is signed out
                setUser(null);
            }
            setLoading(false); // Done checking auth
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // (This 'static' user list is still for demo)
    useEffect(() => {
        const staticUsers = [
            { id: '1', name: 'Jennifer Lisity', status: 'Active Now', avatar: 'https://i.pravatar.cc/150?img=1', lastMessage: "Said one, let. Morning them, said. So were..." },
            { id: '2', name: 'Nancy J. Martinez', status: 'Online', avatar: 'https.i.pravatar.cc/150?img=2', lastMessage: "Hey Jennifer, I just saw your message right now..." },
            { id: '3', name: 'Helen Pool', status: '1h ago', avatar: 'https.i.pravatar.cc/150?img=3', lastMessage: "abundantly be fruitful morning moveth hath..." }
        ];
        setChats(staticUsers);
    }, []);

    // (This message listener is the same as before)
    useEffect(() => {
        if (!selectedChatId) return; 

        const q = query(
          collection(db, 'chats', selectedChatId, 'messages'),
          orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newMessages = [];
            querySnapshot.forEach((doc) => {
                newMessages.push({ ...doc.data(), id: doc.id });
            });
            setMessages(newMessages);
        });

        return () => {
          unsubscribe(); 
        };
    }, [selectedChatId]); 


    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
        setMessages([]); 
        setView('inbox');
    };

    // --- 5. UPDATE SEND MESSAGE TO USE REAL USER ---
    const handleSendMessage = async (messageContent) => {
        if (!selectedChatId || !messageContent.trim() || !user) return; // Check for user

        const newMessage = {
            senderId: user.uid, // <-- Use the logged-in user's ID
            senderName: user.email.split('@')[0], // <-- Use their email as a name
            content: messageContent,
            avatar: 'https://i.pravatar.cc/150?img=10', // (You'd get this from their profile)
            timestamp: serverTimestamp() 
        };

        await addDoc(collection(db, 'chats', selectedChatId, 'messages'), newMessage);
    };

    const selectedChat = chats.find(chat => chat.id === selectedChatId);

    // --- 6. NEW RENDER LOGIC ---
    if (loading) {
        return <div className="auth-container"><h2>Loading...</h2></div>;
    }

    if (!user) {
        return authView === 'login' ? (
            <Login onSwitchToSignUp={() => setAuthView('signup')} />
        ) : (
            <SignUp onSwitchToLogin={() => setAuthView('login')} />
        );
    }

    return (
        <div className="app-container">
            <Sidebar user={user} currentView={view} onSetView={setView} />
            
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
                        currentUser={user} // Pass the real user
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