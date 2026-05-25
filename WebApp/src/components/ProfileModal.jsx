import { useAuth } from '../store/AuthContext';
import { auth } from '../firebase';
import { motion } from 'framer-motion';

export default function ProfileModal({ onClose, onOpenHistory, onOpenPrivacy, onOpenTerms }) {
  const { user } = useAuth();

  const avatarHtml = user?.photoURL
    ? `<img src="${user.photoURL}" alt="Profile" onerror="this.parentElement.innerHTML='<i class=fa-solid fa-user></i>'">`
    : '<i class="fa-solid fa-user"></i>';

  const handleSwitchAccount = () => {
    onClose();
    setTimeout(() => {
      auth.signOut().then(() => {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        auth.signInWithPopup(provider).catch(() => {});
      });
    }, 300);
  };

  return (
    <motion.div 
      className="profile-modal-overlay" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex' }}
    >
      <motion.div 
        className="profile-modal-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 200 }}
      >
        <div className="pm-account-row" id="pm-account-row">
          <div className="pm-avatar-lg" id="pm-avatar-lg" dangerouslySetInnerHTML={{ __html: avatarHtml }} />
          <div className="pm-account-info">
            <span className="pm-display-name" id="pm-display-name">{user?.displayName || 'HalalTune User'}</span>
            <span className="pm-email" id="pm-email">{user?.email || ''}</span>
            <a className="pm-manage-link" href="https://myaccount.google.com" target="_blank" rel="noopener">
              Manage your Google Account
            </a>
          </div>
          <button className="pm-close-btn" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="pm-divider"></div>
        <nav className="pm-menu">
          <button className="pm-menu-item" onClick={() => { onClose(); setTimeout(onOpenHistory, 300); }}>
            <i className="fa-solid fa-clock-rotate-left pm-icon"></i>
            <span>History</span>
            <i className="fa-solid fa-chevron-right pm-chevron"></i>
          </button>
          <button className="pm-menu-item" onClick={handleSwitchAccount}>
            <i className="fa-solid fa-repeat pm-icon"></i>
            <span>Switch account</span>
            <i className="fa-solid fa-chevron-right pm-chevron"></i>
          </button>
          <button className="pm-menu-item" onClick={() => window.open('mailto:support@halaltune.app?subject=Help%20%26%20Feedback', '_blank')}>
            <i className="fa-solid fa-circle-question pm-icon"></i>
            <span>Help & feedback</span>
            <i className="fa-solid fa-chevron-right pm-chevron"></i>
          </button>
          <button className="pm-menu-item pm-signout-item" onClick={() => { onClose(); setTimeout(() => auth.signOut(), 300); }}>
            <i className="fa-solid fa-arrow-right-from-bracket pm-icon"></i>
            <span>Sign out</span>
          </button>
        </nav>
        <div className="pm-divider"></div>
        <div className="pm-footer-links">
          <button className="pm-footer-link" onClick={() => { onClose(); setTimeout(onOpenPrivacy, 300); }}>Privacy Policy</button>
          <span className="pm-footer-dot">•</span>
          <button className="pm-footer-link" onClick={() => { onClose(); setTimeout(onOpenTerms, 300); }}>Terms of Service</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
