import React, { useState, useEffect } from 'react';
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
    const [user, setUser] = useState(null);
    const [authView, setAuthView] = useState('login');
    const [loading, setLoading] = useState(true);

    const [chats, setChats] = useState([]);
    
    // --- 1. STATE CHANGE ---
    // We now track the selected USER and the selected ROOM ID separately.
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('inbox');

    // (Auth listener is the same)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                setUser(authUser);
            } else {
                setUser(null);
            }
            setLoading(false); 
        });
        return () => unsubscribe();
    }, []);

    // (Dynamic user list listener is the same)
    useEffect(() => {
        if (!user) return; 

        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersList = [];
            querySnapshot.forEach((doc) => {
                if (doc.data().uid !== user.uid) {
                    usersList.push({
                         ...doc.data(),
                         id: doc.data().uid, 
                         lastMessage: "Tap to start chatting..."
                    });
                }
            });
            setChats(usersList);
        });
        return () => unsubscribe();
    }, [user]); 

    // --- 2. MESSAGE LISTENER UPDATE ---
    // This now depends on 'selectedRoomId'
    useEffect(() => {
        if (!selectedRoomId) return; // <-- Changed

        const q = query(
          collection(db, 'chats', selectedRoomId, 'messages'), // <-- Changed
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
    }, [selectedRoomId]); // <-- Changed

    // --- 3. HANDLESELECTCHAT UPDATE ---
    // This now sets both the user and the room ID
    const handleSelectChat = (otherUser) => {
        if (!user || !otherUser) return;

        const otherUserUid = otherUser.uid; 
        const currentUserUid = user.uid;

        const roomId = currentUserUid < otherUserUid 
            ? `${currentUserUid}_${otherUserUid}` 
            : `${otherUserUid}_${currentUserUid}`;

        setSelectedRoomId(roomId); // Set the room
        setSelectedChatUser(otherUser); // Set the user
        setMessages([]); 
        setView('inbox');
    };

    // --- 4. SEND MESSAGE UPDATE ---
    // This now uses 'selectedRoomId'
    const handleSendMessage = async (messageContent) => {
        if (!selectedRoomId || !messageContent.trim() || !user) return; // <-- Changed

        const newMessage = {
            senderId: user.uid, 
            senderName: user.email.split('@')[0],
            content: messageContent,
            avatar: 'https://i.pravatar.cc/150?u=' + user.uid,
            timestamp: serverTimestamp() 
        };

        await addDoc(collection(db, 'chats', selectedRoomId, 'messages'), newMessage); // <-- Changed
    };

    // --- 5. RENDER LOGIC UPDATE ---
    // We no longer need 'selectedChat' because we have 'selectedChatUser'
    // const selectedChat = chats.find(chat => chat.id === selectedChatId); // <-- DELETED

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
                    // We pass the selected user's ID for highlighting
                    selectedChatId={selectedChatUser ? selectedChatUser.id : null} // <-- Changed
                />
            ) : (
                <ContactList
                    contacts={chats}
                    onSelectContact={handleSelectChat}
                />
            )}

            {/* We now check for 'selectedChatUser' to render the window */}
            {selectedChatUser ? ( // <-- Changed
                <>
                    <ChatWindow
                        key={selectedChatUser.id} // <-- Changed
                        chat={selectedChatUser} // <-- Changed
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        currentUser={user}
                    />
                    <ProfileInfo user={selectedChatUser} /> // <-- Changed
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