import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
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
    const [userProfile, setUserProfile] = useState(null);
    const [authView, setAuthView] = useState('login');
    const [loading, setLoading] = useState(true);

    const [chats, setChats] = useState([]); 
    
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('inbox');
    const [lastMessages, setLastMessages] = useState({});

    // --- THIS IS THE FIXED AUTH LISTENER ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                setUser(authUser);
                const userDocRef = doc(db, "users", authUser.uid);
                const unsubProfile = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUserProfile(doc.data());
                    } else {
                        console.log("User profile not found in Firestore!");
                    }
                    // We only stop loading AFTER we have the profile
                    setLoading(false); 
                });
                return () => unsubProfile(); 
            } else {
                setUser(null);
                setUserProfile(null);
                // We also stop loading if the user is logged out
                setLoading(false); 
            }
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

    // Last messages listener (same as before)
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "lastMessages"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesByRoom = {};
            snapshot.forEach(doc => { messagesByRoom[doc.id] = doc.data(); });
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

    // handleSendMessage (same as before)
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
        await setDoc(doc(db, "lastMessages", selectedRoomId), newMessage);
    };

    // toggleFavorite (same as before)
    const handleToggleFavorite = async (otherUserUid) => {
        if (!userProfile) return;
        const userDocRef = doc(db, "users", user.uid);
        const isFavorite = userProfile.favorites.includes(otherUserUid);
        if (isFavorite) {
            await updateDoc(userDocRef, { favorites: arrayRemove(otherUserUid) });
        } else {
            await updateDoc(userDocRef, { favorites: arrayUnion(otherUserUid) });
        }
    };

    // Combining/sorting chats (same as before)
    const chatsWithLastMessages = useMemo(() => {
        if (!userProfile) return [];
        const favoritesList = userProfile.favorites || [];
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
                timestamp: lastMsg ? lastMsg.timestamp : null,
                isFavorite: favoritesList.includes(chat.uid)
            };
        }).sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
    }, [chats, lastMessages, user, userProfile]);

    // Favorites list (same as before)
    const favoriteChats = useMemo(() => {
        return chatsWithLastMessages.filter(chat => chat.isFavorite);
    }, [chatsWithLastMessages]);

    // RENDER LOGIC
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

    let listToShow = chatsWithLastMessages;
    if (view === 'contacts') {
        listToShow = chats; 
    } else if (view === 'favorites') {
        listToShow = favoriteChats;
    }

    return (
        <div className="app-container">
            <Sidebar user={user} currentView={view} onSetView={setView} />
            
            {view === 'contacts' ? (
                 <ContactList
                    contacts={chats}
                    onSelectContact={handleSelectChat}
                />
            ) : (
                 <ChatList
                    chats={listToShow} 
                    onSelectChat={handleSelectChat}
                    selectedChatId={selectedChatUser ? selectedChatUser.id : null}
                />
            )}

            {/* --- THIS IS THE SECOND PART OF THE FIX --- */}
            {/* We must check for userProfile before rendering ProfileInfo */}
            {selectedChatUser ? (
                <>
                    <ChatWindow
                        key={selectedChatUser.id}
                        chat={selectedChatUser}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        currentUser={user}
                    />
                    {/* Only render ProfileInfo if userProfile is loaded */}
                    {userProfile && (
                        <ProfileInfo 
                            user={selectedChatUser} 
                            onToggleFavorite={handleToggleFavorite}
                            isFavorite={userProfile.favorites.includes(selectedChatUser.uid)}
                        />
                    )}
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