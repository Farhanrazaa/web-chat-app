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
  updateDoc, // <-- 1. IMPORT updateDoc
  arrayUnion, // <-- 2. IMPORT arrayUnion
  arrayRemove, // <-- 3. IMPORT arrayRemove
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
    const [user, setUser] = useState(null); // Auth user object
    const [userProfile, setUserProfile] = useState(null); // <-- 4. NEW: User profile from DB
    const [authView, setAuthView] = useState('login');
    const [loading, setLoading] = useState(true);

    const [chats, setChats] = useState([]); 
    
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('inbox'); // 'inbox', 'contacts', or 'favorites'
    const [lastMessages, setLastMessages] = useState({});

    // Auth listener (This now also fetches the user's profile)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                setUser(authUser);
                // --- 5. NEW: Fetch the user's profile from Firestore ---
                const userDocRef = doc(db, "users", authUser.uid);
                const unsubProfile = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUserProfile(doc.data());
                    } else {
                        // This might happen if signup fails to create the doc
                        console.log("User profile not found in Firestore!");
                    }
                });
                setLoading(false);
                return () => unsubProfile(); // Cleanup profile listener
            } else {
                setUser(null);
                setUserProfile(null);
                setLoading(false); 
            }
        });
        return () => unsubscribe(); // Cleanup auth listener
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

    // --- 6. NEW: TOGGLE FAVORITE FUNCTION ---
    const handleToggleFavorite = async (otherUserUid) => {
        if (!userProfile) return;

        const userDocRef = doc(db, "users", user.uid);
        const isFavorite = userProfile.favorites.includes(otherUserUid);

        if (isFavorite) {
            // Remove from favorites
            await updateDoc(userDocRef, {
                favorites: arrayRemove(otherUserUid)
            });
        } else {
            // Add to favorites
            await updateDoc(userDocRef, {
                favorites: arrayUnion(otherUserUid)
            });
        }
    };

    // --- 7. UPDATED: COMBINE USERS, MESSAGES, AND FAVORITES ---
    const chatsWithLastMessages = useMemo(() => {
        if (!userProfile) return []; // Don't process if profile isn't loaded

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
                isFavorite: favoritesList.includes(chat.uid) // <-- Check if user is a favorite
            };
        }).sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
    }, [chats, lastMessages, user, userProfile]);

    // --- 8. NEW: CREATE THE FAVORITES-ONLY LIST ---
    const favoriteChats = useMemo(() => {
        return chatsWithLastMessages.filter(chat => chat.isFavorite);
    }, [chatsWithLastMessages]);


    // --- 9. RENDER LOGIC (UPDATED) ---
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

    // Determine which list to show
    let listToShow = chatsWithLastMessages;
    if (view === 'contacts') {
        listToShow = chats; // Contacts list shouldn't be sorted by time
    } else if (view === 'favorites') {
        listToShow = favoriteChats; // Show only favorites
    }

    return (
        <div className="app-container">
            {/* We now pass 'setView' to the Sidebar */}
            <Sidebar user={user} currentView={view} onSetView={setView} />
            
            {view === 'contacts' ? (
                 <ContactList
                    contacts={chats}
                    onSelectContact={handleSelectChat}
                />
            ) : (
                 <ChatList
                    // We pass the correct list based on the view
                    chats={listToShow} 
                    onSelectChat={handleSelectChat}
                    selectedChatId={selectedChatUser ? selectedChatUser.id : null}
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
                    <ProfileInfo 
                        user={selectedChatUser} 
                        // --- 10. PASS NEW PROPS ---
                        onToggleFavorite={handleToggleFavorite}
                        isFavorite={userProfile.favorites.includes(selectedChatUser.uid)}
                    />
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