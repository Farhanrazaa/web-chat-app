import React, { useState, useEffect } from 'react';
// --- 1. IMPORT AUTH AND FIRESTORE ---
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

// --- 2. IMPORT COMPONENTS ---
import Login from './components/Login';
import SignUp from './components/SignUp';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import ProfileInfo from './components/ProfileInfo';
import ContactList from './components/ContactList';
import { FaComments } from 'react-icons/fa';
import './App.css';

function App() {
    // --- 3. STATE ---
    const [user, setUser] = useState(null); // Will hold the auth'd user
    const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
    const [loading, setLoading] = useState(true); // For initial auth check

    const [chats, setChats] = useState([]); // This is now your dynamic user list
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('inbox');

    // --- 4. AUTHENTICATION LISTENER ---
    // Checks if the user is logged in or out
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

    // --- 5. DYNAMIC USER LIST LISTENER ---
    // Replaces the old 'staticUsers' block
    useEffect(() => {
        if (!user) return; // Don't fetch if no user is logged in

        // Create a query to get all documents from the 'users' collection
        const q = query(collection(db, "users"));

        // Use onSnapshot to listen for real-time updates
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersList = [];
            querySnapshot.forEach((doc) => {
                // Don't add the current logged-in user to their own chat list
                if (doc.data().uid !== user.uid) {
                    // We'll use the user's UID as the 'chat ID'
                    // and add a placeholder lastMessage
                    usersList.push({
                         ...doc.data(),
                         id: doc.data().uid, // Use UID as the ID for the chat list
                         lastMessage: "Tap to start chatting..."
                    });
                }
            });
            setChats(usersList);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();

    }, [user]); // Re-run this effect if the user logs in or out

    // --- 6. REAL-TIME MESSAGE LISTENER ---
    // (This is the same as before)
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

    // --- 7. SEND MESSAGE FUNCTION ---
    // (This is the same as before)
    const handleSendMessage = async (messageContent) => {
        if (!selectedChatId || !messageContent.trim() || !user) return;

        const newMessage = {
            senderId: user.uid, 
            senderName: user.email.split('@')[0],
            content: messageContent,
            avatar: 'https://i.pravatar.cc/150?u=' + user.uid, // Use a unique avatar
            timestamp: serverTimestamp() 
        };

        await addDoc(collection(db, 'chats', selectedChatId, 'messages'), newMessage);
    };

    const selectedChat = chats.find(chat => chat.id === selectedChatId);

    // --- 8. RENDER LOGIC ---
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