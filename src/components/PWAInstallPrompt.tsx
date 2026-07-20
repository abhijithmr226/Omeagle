import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pwa_install_dismissed') === 'true'
  );

  useEffect(() => {
    // Don't show if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay showing the prompt — let user explore first
      setTimeout(() => setShow(true), 8000);
    };

    const installedHandler = () => {
      setInstalled(true);
      setShow(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
    setDismissed(true);
  };

  if (!show || installed) return null;

  return (
    <>
      <style>{`
        .pwa-prompt {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          width: min(92vw, 380px);
          background: var(--bg-surface, #1a1a2e);
          border: 1px solid rgba(99, 102, 241, 0.35);
          border-radius: 1.2rem;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(99,102,241,0.1);
          padding: 1.1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: pwa-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        @keyframes pwa-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .pwa-icon-wrap {
          width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }
        .pwa-text { flex: 1; min-width: 0; }
        .pwa-title {
          font-weight: 700; font-size: 0.9rem;
          color: var(--text-primary, #fff);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pwa-subtitle {
          font-size: 0.75rem; color: var(--text-muted, #9ca3af);
          margin-top: 0.15rem;
        }
        .pwa-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .pwa-install-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; border: none; border-radius: 0.6rem;
          padding: 0.5rem 1rem; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: opacity 0.15s;
          white-space: nowrap;
        }
        .pwa-install-btn:hover { opacity: 0.88; }
        .pwa-dismiss-btn {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: var(--bg-surface-secondary, #2a2a40); border: none;
          color: var(--text-muted, #9ca3af); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .pwa-dismiss-btn:hover { background: var(--border-color, #3a3a55); }
      `}</style>
      <div className="pwa-prompt" role="dialog" aria-label="Install Omeagle app">
        <div className="pwa-icon-wrap">
          <Smartphone size={24} color="#fff" />
        </div>
        <div className="pwa-text">
          <div className="pwa-title">Add Omeagle to Home Screen</div>
          <div className="pwa-subtitle">Chat faster — works offline too</div>
        </div>
        <div className="pwa-actions">
          <button className="pwa-install-btn" onClick={handleInstall}>
            <Download size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Install
          </button>
          <button className="pwa-dismiss-btn" onClick={handleDismiss} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      </div>
    </>
  );
};
