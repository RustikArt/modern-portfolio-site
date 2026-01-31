import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import './index.css'

// Wrapper to conditionally load Analytics based on cookie consent
const ConditionalAnalytics = () => {
  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem('cookie_consent') === 'accepted';
  });

  useEffect(() => {
    // Listen for consent changes
    const handleConsentChange = () => {
      setHasConsent(localStorage.getItem('cookie_consent') === 'accepted');
    };

    window.addEventListener('cookie_consent_changed', handleConsentChange);
    return () => window.removeEventListener('cookie_consent_changed', handleConsentChange);
  }, []);

  // Only render Analytics if user accepted cookies
  if (!hasConsent) return null;
  return <Analytics />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ConditionalAnalytics />
    </BrowserRouter>
  </React.StrictMode>,
)
