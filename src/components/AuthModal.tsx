import React, { useState } from "react";
import { X, LogIn, Mail, Lock, User, ShieldCheck } from "lucide-react";
import {
  auth,
  loginWithGoogle,
  loginAnonymously,
  logoutUser
} from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, user }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAnonymously();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to continue as Guest.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      onClose();
    } catch (err: any) {
      setError(err.message || "Logout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#c5c5d4]/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#c5c5d4]/30 flex items-center justify-between bg-[#f7f9fb]">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[#3f51b5]" />
            <h3 className="font-bold text-lg font-headline text-[#191c1e]">
              {user ? "Account & Sync" : isSignUp ? "Create Account" : "Sign In"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#757684] hover:bg-[#eceef0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          {user ? (
            <div className="flex flex-col gap-4 text-center py-2">
              <div className="w-16 h-16 bg-[#3f51b5]/10 rounded-full flex items-center justify-center mx-auto text-[#3f51b5] font-bold text-xl">
                {user.email ? user.email[0].toUpperCase() : user.isAnonymous ? "G" : "U"}
              </div>
              <div>
                <h4 className="font-bold text-[#191c1e] text-base">
                  {user.displayName || (user.isAnonymous ? "Guest User" : user.email)}
                </h4>
                <p className="text-xs text-[#757684]">
                  {user.isAnonymous ? "Anonymous Session" : user.email}
                </p>
              </div>

              <div className="p-3 bg-[#f7f9fb] border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Firestore Synchronization Active for Decisions
              </div>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="mt-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold font-button transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-lg">
                  {error}
                </div>
              )}

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white border border-[#c5c5d4] hover:bg-[#f7f9fb] text-[#191c1e] font-semibold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px bg-[#c5c5d4]/40" />
                <span className="text-[11px] font-mono text-[#757684] uppercase">OR</span>
                <div className="flex-1 h-px bg-[#c5c5d4]/40" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#191c1e] flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#3f51b5]" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-9 px-3 rounded-lg border border-[#c5c5d4]/50 bg-[#f7f9fb] text-xs focus:border-[#3f51b5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#191c1e] flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#3f51b5]" /> Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 px-3 rounded-lg border border-[#c5c5d4]/50 bg-[#f7f9fb] text-xs focus:border-[#3f51b5] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 h-9 bg-[#3f51b5] text-white rounded-lg text-xs font-semibold font-button hover:bg-[#24389c] transition-colors"
                >
                  {isSignUp ? "Sign Up with Email" : "Sign In with Email"}
                </button>
              </form>

              <div className="flex justify-between items-center text-xs text-[#757684] pt-2 border-t border-[#c5c5d4]/30">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="hover:text-[#3f51b5] underline font-medium"
                >
                  {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                </button>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="text-[#3f51b5] hover:underline font-semibold"
                >
                  Guest Mode →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
