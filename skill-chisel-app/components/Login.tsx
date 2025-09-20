"use client";

import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Mail, Lock } from 'lucide-react';
import { auth } from '../firebase/config'; // Make sure you're importing the auth instance

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const googleProvider = new GoogleAuthProvider();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const action = isLogin ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
    try {
      await action(auth, email, password);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-20 backdrop-blur-xl rounded-2xl shadow-lg border border-white border-opacity-30 text-white">
        <div className="text-center">
          <h2 className="text-4xl font-bold">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h2>
          <p className="mt-2 text-indigo-200">
            {isLogin ? 'Sign in to chisel your skills' : 'Start your journey today'}
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleAuthAction}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={20}/>
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-indigo-200" 
              required 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={20}/>
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-indigo-200" 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3 px-4 font-semibold text-indigo-600 bg-white rounded-xl hover:bg-opacity-90 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {error && <p className="text-sm text-yellow-300 text-center bg-red-500 bg-opacity-30 p-2 rounded-lg">{error}</p>}

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-indigo-300 border-opacity-50"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-indigo-500 bg-opacity-50 rounded-full text-indigo-200">OR</span></div>
        </div>

        <button 
          onClick={handleGoogleSignIn} 
          className="w-full flex items-center justify-center gap-3 py-3 px-4 font-semibold text-white bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl hover:bg-opacity-30 transition-colors duration-300"
        >
          <svg className="w-5 h-5" aria-hidden="true" focusable="false" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.3 0 256S110.3 0 244 0c73 0 135.3 29.3 182.2 75.3l-63.4 61.8C334.2 110.1 292.5 90.4 244 90.4 156.9 90.4 89.2 159.2 89.2 248.8s67.7 158.4 154.8 158.4c89.2 0 126.3-59.5 133.5-90.8h-133.5v-73.4h229.1c1.2 6.6 2.3 13.4 2.3 20.6z"></path></svg>
          Sign in with Google
        </button>

        <p className="text-sm text-center text-indigo-200">
          {isLogin ? "Don't have an account?" : 'Already have an account?'} 
          <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-white hover:underline ml-1">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;