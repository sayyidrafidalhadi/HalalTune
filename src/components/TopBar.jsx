export default function TopBar({ onSearchOpen }) {
  return (
    <header className="yt-topbar">
      <div className="topbar-brand" style={{ gap: '10px' }}>
        <svg viewBox="0 0 24 24" style={{ width: '26px', height: '26px', fill: '#FF0000' }}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="10,8 16,12 10,16" style={{ fill: '#FFFFFF' }} />
        </svg>
        <span className="topbar-brand-name" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: '-0.5px' }}>HalalTune</span>
      </div>
      <div className="topbar-right">
        <button className="topbar-search-icon-btn" aria-label="Search" onClick={onSearchOpen}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>
    </header>
  );
}
