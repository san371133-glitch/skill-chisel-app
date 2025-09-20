"use client";

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import ProgressTracker from './ProgressTracker';
import Login from './Login';

const AuthWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener from Firebase checks if the user is logged in or out
    // and updates the state automatically.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup the listener when the component is removed from the screen
    return () => unsubscribe();
  }, []);

  // While Firebase is checking the user's status, show a loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-white font-semibold text-xl animate-pulse">
          Loading Your Workspace...
        </div>
      </div>
    );
  }

  // If a user is logged in, show the main app and pass the user's info to it.
  // Otherwise, show the Login page.
  return user ? <ProgressTracker user={user} /> : <Login />;
};

export default AuthWrapper;