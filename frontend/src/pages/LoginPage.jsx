import React from 'react';
import { useState } from 'react';
import supabase from '../services/supabase/client';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function signInWithEmail(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setError(error.message);
        } else {
        if (onLoginSuccess) {
            onLoginSuccess(data);
        }
        }
    } catch (error) {
        setError('An unexpected error occurred. Please try again.');
    } finally {
        setIsLoading(false);
    }
  }

return (
  /* Outer Container with deep zinc background */
  <div className="relative min-h-screen w-full bg-zinc-950 flex items-center justify-center p-4 overflow-hidden font-sans antialiased">
    
    {/* Ambient Glows / Radial Gradient background effects */}
    <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-sky-500/15 to-transparent blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-[400px] w-[500px] rounded-full bg-gradient-to-br from-slate-800/20 via-zinc-800/10 to-transparent blur-3xl" />

    {/* Main Card with Glassmorphism translucent fill */}
    <div className="relative z-10 w-full max-w-[420px] bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl">
      
      {/* Logo Badge */}
      <div className="flex justify-center mb-5">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-950 font-bold text-base shadow-sm">
          GFSL
        </div>
      </div>

      {/* Header Text */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Gurkha Force Security Limited
        </h2>
        <p className="mt-1 text-s text-slate-400">
          Login to your staff roster and management portal
        </p>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <p className="col-span-2 text-center text-xs text-slate-400 mb-1">
          The social login buttons below are currently for show only and do not function
        </p>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-[#1f2434] bg-[#0d0f17] py-2 px-3 text-xs font-medium text-white hover:bg-[#141824] transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-[#1f2434] bg-[#0d0f17] py-2 px-3 text-xs font-medium text-white hover:bg-[#141824] transition"
        >
          <svg className="h-4 w-4 fill-white" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Sign in with Github
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1d2232]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0d0f17] px-3 text-slate-400">or sign in with</span>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="mb-4 bg-red-950/50 border border-red-800/60 text-red-400 text-xs rounded-lg p-3 flex items-center justify-between">
          <span>{error}</span>
          <button 
            type="button" 
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-200 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Form Fields */}
      <form className="space-y-4" onSubmit={signInWithEmail}>
        <div>
          <label htmlFor="email" className="block text-s font-medium text-slate-200 mb-1.5">
            Email*
          </label>
          <input
            id="email"
            name="email"
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="account@company.com"
            className="block w-full rounded-lg border border-[#1f2434] bg-[#08090d] px-3.5 py-2 text-s text-white placeholder-slate-500 focus:border-slate-400 focus:outline-none transition"
          />
        </div>

        <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1.5">
                Password*
            </label>
            <div className="relative">
                <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full rounded-lg border border-[#1f2434] bg-[#08090d] pl-3.5 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:border-slate-400 focus:outline-none transition"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                    {showPassword ? 'Hide' : 'Show'}
                </button>
            </div>
        </div>

        {/* Options Row */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex items-center text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#1f2434] bg-[#08090d] text-white focus:ring-0 focus:ring-offset-0"
            />
            <span className="ml-2 text-sm">Remember this device</span>
          </label>
          <a href="#forgot" className="text-sm text-white hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center rounded-lg bg-[#e2e8f0] hover:bg-white py-2.5 px-4 text-s font-semibold text-slate-950 transition disabled:opacity-50"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Sign in'
            )}
          </button>
        </div>
      </form>

      {/* Footer */}
      {/* <div className="mt-6 text-center text-s text-slate-400">
        Don't have an account?{' '}
        <a href="#register" className="font-semibold text-white hover:underline">
          Create an account
        </a>
      </div> */}

    </div>
  </div>
);
}