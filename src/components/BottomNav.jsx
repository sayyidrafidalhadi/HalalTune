import { motion } from 'framer-motion';

const tabs = [
  { key: 'all', icon: 'fa-house', label: 'Home', id: 'bn-home' },
  { key: 'categories', icon: 'fa-layer-group', label: 'Categories', id: 'bn-categories' },
  { key: 'library', icon: 'fa-book-open', label: 'Library', id: 'bn-library' },
];

export default function BottomNav({ currentTab, onTabChange, user, onProfileOpen }) {
  const avatarHtml = user?.photoURL
    ? `<img src="${user.photoURL}" alt="Profile" onerror="this.parentElement.innerHTML='<i class=fa-solid fa-user></i>'">`
    : '<i class="fa-solid fa-user"></i>';

  return (
    <nav className="bottom-nav" id="bottom-nav" style={{ position: 'relative' }}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <button
            key={tab.key}
            className={`bn-btn${isActive ? ' active' : ''}`}
            data-tab={tab.key}
            id={tab.id}
            onClick={() => onTabChange(tab.key)}
            style={{ position: 'relative' }}
          >
            {isActive && (
              <motion.div
                layoutId="bottom-nav-active-bubble"
                className="bn-bubble"
                style={{
                  position: 'absolute',
                  inset: '6px 4px',
                  backgroundColor: 'rgba(255, 0, 51, 0.08)',
                  border: '1px solid rgba(255, 0, 51, 0.2)',
                  borderRadius: '12px',
                  zIndex: 0,
                  pointerEvents: 'none',
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <i className={`fa-solid ${tab.icon}`} style={{ color: isActive ? '#FF0000' : 'inherit' }}></i>
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
      <button className="bn-btn" id="bn-account" style={{ position: 'relative' }} onClick={onProfileOpen}>
        <span style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div className="bn-avatar" id="bn-avatar" dangerouslySetInnerHTML={{ __html: avatarHtml }} />
          <span>Account</span>
        </span>
      </button>
    </nav>
  );
}
