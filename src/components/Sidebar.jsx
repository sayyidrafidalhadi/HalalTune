import { auth } from '../firebase';
import { motion } from 'framer-motion';

export default function Sidebar({ currentTab, onTabChange, onProfileOpen }) {
  const tabs = [
    { key: 'all', icon: 'fa-house', label: 'Home' },
    { key: 'categories', icon: 'fa-layer-group', label: 'Categories' },
    { key: 'liked', icon: 'fa-heart', label: 'Liked Songs' },
    { key: 'library', icon: 'fa-book-open', label: 'Library' },
  ];

  return (
    <aside className="yt-sidebar">
      <div className="yt-sidebar-header" style={{ gap: '10px' }}>
        <svg viewBox="0 0 24 24" style={{ width: '28px', height: '28px', fill: '#FF0000', flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="10,8 16,12 10,16" style={{ fill: '#FFFFFF' }} />
        </svg>
        <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: '-0.5px' }}>HalalTune</h2>
      </div>
      <nav className="yt-nav-links" style={{ position: 'relative' }}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              className={`yt-nav-btn${isActive ? ' active' : ''}`}
              data-tab={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    borderLeft: '4px solid #FF0000',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <i className={`fa-solid ${tab.icon}`} style={{ color: isActive ? '#FF0000' : 'inherit' }}></i> 
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </nav>
      <div className="yt-sidebar-bottom">
        <motion.button 
          className="yt-nav-btn" 
          onClick={onProfileOpen}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          style={{ marginBottom: '8px' }}
        >
          <i className="fa-solid fa-user"></i> Profile
        </motion.button>
        <motion.button 
          className="yt-nav-btn" 
          onClick={() => auth.signOut()}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
        </motion.button>
      </div>
    </aside>
  );
}
