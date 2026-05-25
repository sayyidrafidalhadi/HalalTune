import { useState } from 'react';
import firebase, { auth } from '../firebase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuthError = (msg) => {
    setError(msg || '');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      await auth.signInWithPopup(provider);
    } catch (err) {
      const blockedCodes = [
        'auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request',
        'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported',
      ];
      if (blockedCodes.includes(err.code)) {
        try {
          const provider = new firebase.auth.GoogleAuthProvider();
          provider.addScope('email');
          provider.addScope('profile');
          await auth.signInWithRedirect(provider);
        } catch (e) {
          setError('Login failed: ' + e.message);
          setLoading(false);
        }
      } else {
        setError('Login failed: ' + err.message);
        setLoading(false);
      }
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/invalid-credential': 'Incorrect email or password.',
      };
      setError(messages[err.code] || err.message);
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) { setError('Please enter an email and password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      await auth.createUserWithEmailAndPassword(email, password);
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'An account already exists with this email.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
      };
      setError(messages[err.code] || err.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email address above first.'); return; }
    try {
      await auth.sendPasswordResetEmail(email);
      setError('');
      alert('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fullscreen-view" style={{ zIndex: 999 }}>
      <div className="auth-box">
        <img src="icon.png" alt="HalalTune Logo" className="filtered-icon auth-logo" />
        <h2>Welcome</h2>
        <p>Sign in to save your playlists and liked songs across all your devices.</p>
        <button className="yt-primary-btn google-btn" onClick={handleGoogleLogin} disabled={loading}>
          <i className="fa-brands fa-google"></i> Continue with Google
        </button>
        <div className="auth-divider"><span>or</span></div>
        <div id="email-auth-form">
          <input type="email" className="auth-input" placeholder="Email address" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="auth-input" placeholder="Password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="auth-error">{error}</p>}
          <button className="yt-primary-btn" style={{ marginBottom: 10 }} onClick={handleEmailSignIn} disabled={loading}>
            Sign In
          </button>
          <button className="auth-link-btn" onClick={handleEmailSignUp}>Create account</button>
          <button className="auth-link-btn" onClick={handleForgotPassword}>Forgot password?</button>
        </div>
      </div>
    </div>
  );
}
