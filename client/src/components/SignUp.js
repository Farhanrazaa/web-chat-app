import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
            // --- 1. CREATE THE USER ---
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // --- 2. SAVE THE USER TO THE 'users' COLLECTION ---
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                name: user.email.split('@')[0], 
                avatar: `https://i.pravatar.cc/150?u=${user.uid}`,
                createdAt: serverTimestamp()
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
                    // --- THIS IS THE FIX ---
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