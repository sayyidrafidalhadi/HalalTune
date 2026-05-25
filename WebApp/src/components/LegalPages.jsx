import { motion } from 'framer-motion';

export function PrivacyPage({ onClose }) {
  return (
    <motion.div 
      className="legal-page" 
      style={{ display: 'flex' }}
      initial={{ x: '100%', opacity: 0.95 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.95 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
    >
      <div className="legal-header">
        <button className="legal-back-btn" onClick={onClose}><i className="fa-solid fa-arrow-left"></i></button>
        <h2>Privacy Policy</h2>
      </div>
      <div className="legal-body">
        <p className="legal-date">Last updated: June 2025</p>
        <h3>1. Introduction</h3>
        <p>HalalTune ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use the HalalTune Progressive Web App.</p>
        <h3>2. Information We Collect</h3>
        <p><strong>Account Information:</strong> When you sign in with Google, we receive your display name, email address, and profile picture from Google's authentication service. We store your user ID and last login timestamp in our Firebase Firestore database.</p>
        <p><strong>Usage Data:</strong> We collect information about the songs you play, including stream counts and listener identifiers, to improve our recommendation engine and analytics. Your liked songs are stored under your user account.</p>
        <p><strong>Locally Stored Data:</strong> Your recently played songs and anonymous user ID are stored in your device's localStorage. This data never leaves your device unless you are signed in.</p>
        <h3>3. How We Use Your Information</h3>
        <p>We use the information we collect to provide and improve the HalalTune service, personalise your experience (Recents, Liked Songs), generate aggregated analytics to improve our content, and maintain the security of the platform. We do not sell, trade, or rent your personal information to third parties.</p>
        <h3>4. Third-Party Services</h3>
        <p><strong>Firebase (Google):</strong> We use Firebase Authentication and Firestore for user management and data storage. Your data is subject to Google's Privacy Policy.</p>
        <p><strong>Cloudinary:</strong> Audio files and cover art are hosted on Cloudinary's CDN. Media files do not contain personally identifiable information.</p>
        <p><strong>LRCLIB:</strong> Lyrics are fetched from the LRCLIB public API. No personal data is shared with this service.</p>
        <h3>5. Data Retention</h3>
        <p>Your account data is retained as long as your account is active. You may request deletion of your data by contacting us. Liked songs and history are deleted when your account record is removed.</p>
        <h3>6. Children's Privacy</h3>
        <p>HalalTune is designed as a family-friendly platform. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.</p>
        <h3>7. Security</h3>
        <p>We implement industry-standard security measures including Firebase's built-in security rules and HTTPS encryption for all data in transit. However, no method of transmission over the internet is 100% secure.</p>
        <h3>8. Changes to This Policy</h3>
        <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the date at the top of this page.</p>
        <h3>9. Contact Us</h3>
        <p>If you have questions about this Privacy Policy, please reach out through the Help & Feedback option in the app.</p>
      </div>
    </motion.div>
  );
}

export function TermsPage({ onClose }) {
  return (
    <motion.div 
      className="legal-page" 
      style={{ display: 'flex' }}
      initial={{ x: '100%', opacity: 0.95 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.95 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
    >
      <div className="legal-header">
        <button className="legal-back-btn" onClick={onClose}><i className="fa-solid fa-arrow-left"></i></button>
        <h2>Terms of Service</h2>
      </div>
      <div className="legal-body">
        <p className="legal-date">Last updated: June 2025</p>
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or using HalalTune, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.</p>
        <h3>2. Description of Service</h3>
        <p>HalalTune is a free Progressive Web App that provides access to a curated library of halal Islamic audio content, including nasheeds and vocal-only Islamic recitations. The service is provided "as is" and may be updated or modified at any time.</p>
        <h3>3. User Accounts</h3>
        <p>You may use HalalTune without an account, but signing in with Google unlocks personalised features such as Liked Songs sync across devices. You are responsible for maintaining the confidentiality of your Google account credentials. You must be at least 13 years of age to create an account.</p>
        <h3>4. Acceptable Use</h3>
        <p>You agree to use HalalTune only for lawful purposes. You must not attempt to reverse-engineer, scrape, or redistribute the content or the application. You must not use the service to distribute harmful, offensive, or non-halal content. Automated access (bots) is strictly prohibited.</p>
        <h3>5. Content and Intellectual Property</h3>
        <p>All audio content available on HalalTune is either owned by us, licensed, or is in the public domain. The HalalTune name, logo, and interface design are our intellectual property. You may not reproduce or distribute any content from HalalTune without explicit written permission.</p>
        <h3>6. Halal Content Policy</h3>
        <p>HalalTune is dedicated exclusively to halal audio. All content is manually reviewed and curated. We reserve the right to remove any content that does not meet our halal standards at any time without prior notice.</p>
        <h3>7. Disclaimer of Warranties</h3>
        <p>HalalTune is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, error-free, or free of viruses.</p>
        <h3>8. Limitation of Liability</h3>
        <p>To the fullest extent permitted by law, HalalTune shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the service.</p>
        <h3>9. Termination</h3>
        <p>We reserve the right to suspend or terminate your access to HalalTune at any time, without notice, for conduct that we determine violates these Terms of Service or is harmful to other users, us, or third parties.</p>
        <h3>10. Governing Law</h3>
        <p>These Terms of Service shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms shall be resolved through good-faith negotiation.</p>
        <h3>11. Changes to Terms</h3>
        <p>We reserve the right to modify these Terms of Service at any time. Continued use of HalalTune after changes are posted constitutes your acceptance of the updated terms.</p>
        <h3>12. Contact</h3>
        <p>For questions regarding these Terms of Service, please use the Help & Feedback option in the app.</p>
      </div>
    </motion.div>
  );
}
