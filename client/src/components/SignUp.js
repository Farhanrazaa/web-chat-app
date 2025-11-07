import React, { useState } from 'react';
import { auth, db } from '../firebase'; // <-- 1. IMPORT db
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // <-- 2. IMPORT doc and setDoc

import './Auth.css';

function SignUp({ onSwitchToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        try {
            // --- 3. CREATE THE USER ---
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // --- 4. SAVE THE USER TO THE 'users' COLLECTION ---
            // We use setDoc to create a new document with the user's UID as its ID
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                name: user.email.split('@')[0], // Use email prefix as a default name
                avatar: `https://i.pravatar.cc/150?u=${user.uid}` // Generate a unique random avatar
            });

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSignUp} className="auth-form">
                <h2>Sign Up</h2>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                {error && <p className="auth-error">{error}</p>}
                <button type="submit">Sign Up</button>
                <p className="auth-switch">
                    Already have an account?{' '}
                    <span onClick={onSwitchToLogin}>Log In</span>
                </p>
            </form>
        </div>
    );
}

export default SignUp;