import React, { useState, useEffect, useMemo } from 'react'; // <-- 1. IMPORT useMemo
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc, // <-- 2. IMPORT setDoc
  doc,    // <-- 3. IMPORT doc
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
    
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('inbox');

    // --- 4. NEW STATE ---
    // This will hold the last message for *every* room
    const [lastMessages, setLastMessages] = useState({});

    // Auth listener (same as before)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) { setUser(authUser); } else { setUser(null); }
            setLoading(false); 
        });
        return () => unsubscribe();
    }, []);

    // Dynamic user list listener (same as before)
    useEffect(() => {
        if (!user) return; 
        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersList = [];
            querySnapshot.forEach((doc) => {
                if (doc.data().uid !== user.uid) {
                    usersList.push({ ...doc.data(), id: doc.data().uid });
                }
            });
            setChats(usersList);
        });
        return () => unsubscribe();
    }, [user]); 

    // --- 5. NEW LISTENER FOR LAST MESSAGES ---
    // This listens to our new 'lastMessages' collection
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "lastMessages"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesByRoom = {};
            snapshot.forEach(doc => {
                messagesByRoom[doc.id] = doc.data();
            });
            setLastMessages(messagesByRoom);
        });
        return () => unsubscribe();
    }, [user]);

    // Message listener (same as before)
    useEffect(() => {
        if (!selectedRoomId) return; 
        const q = query(
          collection(db, 'chats', selectedRoomId, 'messages'),
          orderBy('timestamp', 'asc')
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newMessages = [];
            querySnapshot.forEach((doc) => { newMessages.push({ ...doc.data(), id: doc.id }); });
            setMessages(newMessages);
        });
        return () => { unsubscribe(); };
    }, [selectedRoomId]); 

    // handleSelectChat (same as before)
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

    // --- 6. UPDATED SEND MESSAGE FUNCTION ---
    const handleSendMessage = async (messageContent) => {
        if (!selectedRoomId || !messageContent.trim() || !user) return;

        const newMessage = {
            senderId: user.uid, 
            senderName: user.email.split('@')[0],
            content: messageContent,
            avatar: 'https://i.pravatar.cc/150?u=' + user.uid,
            timestamp: serverTimestamp() 
        };

        // 1. Add the message to the specific chat room's sub-collection
        await addDoc(collection(db, 'chats', selectedRoomId, 'messages'), newMessage);

        // 2. ALSO update the 'lastMessages' collection for the preview
        await setDoc(doc(db, "lastMessages", selectedRoomId), newMessage);
    };

    // --- 7. NEW: COMBINE USERS AND LAST MESSAGES ---
    // This combines our two lists (users and messages)
    // and sorts the chat list by the most recent message.
    const chatsWithLastMessages = useMemo(() => {
        return chats.map(chat => {
            const currentUserUid = user.uid;
            const otherUserUid = chat.uid;
            const roomId = currentUserUid < otherUserUid 
                ? `${currentUserUid}_${otherUserUid}` 
                : `${otherUserUid}_${currentUserUid}`;
            
            const lastMsg = lastMessages[roomId];
            
            return {
                ...chat,
                lastMessage: lastMsg ? lastMsg.content : "Tap to start chatting...",
                timestamp: lastMsg ? lastMsg.timestamp : null
            };
        }).sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
    }, [chats, lastMessages, user]);


    // --- 8. RENDER LOGIC (UPDATED) ---
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
            
            {/* We now pass in the new combined/sorted list */}
            {view === 'inbox' ? (
                <ChatList
                    chats={chatsWithLastMessages}
                    onSelectChat={handleSelectChat}
                    selectedChatId={selectedChatUser ? selectedChatUser.id : null}
                />
            ) : (
                <ContactList
                    contacts={chatsWithLastMessages}
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