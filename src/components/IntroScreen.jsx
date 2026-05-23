export default function IntroScreen({ onGetStarted }) {
  return (
    <div className="fullscreen-view" style={{ zIndex: 1000 }}>
      <div className="intro-content">
        <img src="icon.png" alt="HalalTune Logo" className="filtered-icon intro-logo" />
        <h1 className="intro-title">HalalTune</h1>
        <p className="intro-description">Pure, distraction-free Islamic audio.</p>
        <button className="yt-primary-btn" onClick={onGetStarted}>Get Started</button>
      </div>
    </div>
  );
}
