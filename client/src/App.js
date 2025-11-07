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
    
    // These two states are the core of the fix
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('inbox');

    // Auth listener
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

    // Dynamic user list listener
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

    // Message listener (now depends on selectedRoomId)
    useEffect(() => {
        if (!selectedRoomId) return; 

        const q = query(
          collection(db, 'chats', selectedRoomId, 'messages'),
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
    }, [selectedRoomId]); 

    // handleSelectChat (now creates a unique room ID)
    const handleSelectChat = (otherUser) => {
        if (!user || !otherUser) return;

        const otherUserUid = otherUser.uid; 
        const currentUserUid = user.uid;

        const roomId = currentUserUid < otherUserUid 
            ? `${currentUserUid}_${otherUserUid}` 
            : `${otherUserUid}_${currentUserUid}`;

        setSelectedRoomId(roomId); 
        setSelectedChatUser(otherUser);
        setMessages([]); 
        setView('inbox');
    };

    // handleSendMessage (now uses selectedRoomId)
    const handleSendMessage = async (messageContent) => {
        if (!selectedRoomId || !messageContent.trim() || !user) return;

        const newMessage = {
            senderId: user.uid, 
            senderName: user.email.split('@')[0],
            content: messageContent,
            avatar: 'https://i.pravatar.cc/150?u=' + user.uid,
            timestamp: serverTimestamp() 
        };

        await addDoc(collection(db, 'chats', selectedRoomId, 'messages'), newMessage);
    };

    // Render Logic
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
                    selectedChatId={selectedChatUser ? selectedChatUser.id : null}
                />
            ) : (
                <ContactList
                    contacts={chats}
                    onSelectContact={handleSelectChat}
                />
            )}

            {selectedChatUser ? (
                <>
                    <ChatWindow
                        key={selectedChatUser.id}
                        chat={selectedChatUser}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        currentUser={user}
                    />
                    <ProfileInfo user={selectedChatUser} />
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