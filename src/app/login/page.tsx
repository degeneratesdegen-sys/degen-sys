'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Logo } from '@/components/logo';
import { Info, Loader2, X } from 'lucide-react';

const GoogleIconFull = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useUser();
  const router = useRouter();
  const [hostname, setHostname] = useState('');
  const [devOpen, setDevOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
    setHostname(window.location.hostname);
  }, [user, loading, router]);

  const showDevHint = useMemo(() => {
    if (!hostname) return false;
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    );
  }, [hostname]);

  if (loading || user) {
    return (
      <div className="bn-body">
        <div className="bn-center">
          <Loader2 className="h-10 w-10 animate-spin text-[rgba(58,157,99,1)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bn-body"><div className="bn-container">
        <div className="bn-card">
          {showDevHint && (
            <div className="bn-dev">
              <button
                type="button"
                className="bn-dev-btn"
                onClick={() => setDevOpen((v) => !v)}
                aria-label="Firebase setup info"
                title="Firebase setup info"
              >
                <Info className="h-4 w-4" />
              </button>

              {devOpen && (
                <div className="bn-dev-pop">
                  <div className="bn-dev-head">
                    <div>
                      <p className="bn-dev-title">Firebase setup (dev)</p>
                      <p className="bn-dev-sub">
                        If Google sign-in fails, add this domain to Authorized domains:
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bn-dev-close"
                      onClick={() => setDevOpen(false)}
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="bn-dev-host" title="Tap and hold to copy">
                    {hostname}
                  </div>
                  <div className="bn-dev-path">
                    Firebase → Authentication → Settings → Authorized domains
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bn-logoWrap">
            <div className="bn-logo">
              <Logo className="h-24 w-auto scale-[2]" />
            </div>
            <h1 className="bn-h1">NestEgg</h1>
            <p className="bn-subtitle">Crack Into Savings</p>
          </div>

          <button
            type="button"
            className="bn-btn-login"
            onClick={async () => {
              try {
                setSigningIn(true);
                await signInWithGoogle();
              } finally {
                setSigningIn(false);
              }
            }}
            disabled={signingIn}
          >
            {signingIn ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="bn-divider">or continue with</div>

          <div className="bn-social">
            <button type="button" className="bn-btn-social" onClick={signInWithGoogle}>
              <GoogleIconFull />
              Google
            </button>

            <button
              type="button"
              className="bn-btn-social"
              onClick={() => alert('GitHub login not wired yet.')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </button>
          </div>

          <div className="bn-signup">
            Don&apos;t have an account?{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Sign up for free
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --bn-primary: #2D7A4E;
          --bn-primary-light: #3A9D63;
          --bn-accent-blue: #0EA5E9;
          --bn-accent-gold: #F59E0B;
          --bn-bg-dark: #0A0F14;
          --bn-bg-card: #141B23;
          --bn-bg-input: #1C2631;
          --bn-text-primary: #F8FAFC;
          --bn-text-secondary: #94A3B8;
          --bn-border: #2D3748;
        }

        .bn-body {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bn-bg-dark);
          color: var(--bn-text-primary);
          min-height: 100vh;
          overflow-x: hidden;
        }

        @keyframes33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .bn-container {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          justify-content: stretch;
          padding: 0;
        }

        .bn-card {
          background: var(--bn-bg-dark);
          border: none;
          border-radius: 0;
          padding: 3rem 1.5rem;
          max-width: none;
          width: 100%;
          min-height: 100vh;
          box-shadow: none;
          animation: bn-slideUp 0.5s ease-out;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .bn-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            var(--bn-primary-light) 20%,
            var(--bn-accent-blue) 50%,
            var(--bn-accent-gold) 80%,
            transparent
          );
          opacity: 0.6;
        }

        @keyframes bn-shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        @keyframes bn-slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bn-logoWrap {
          text-align: center;
          margin-bottom: 2rem;
          animation: bn-fadeIn 1s ease-out 0.3s both;
        }

        .bn-logo {
          width: 100px;
          height: 100px;
          margin: 0 auto 1rem;
          animation: bn-gentleFloat 3s infinite ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes bn-gentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes bn-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .bn-h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 2.6rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--bn-text-primary), var(--bn-primary-light));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .bn-subtitle {
          color: var(--bn-text-secondary);
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.28px;
          text-transform: uppercase;
          background: linear-gradient(135deg, rgba(58,157,99,0.95), rgba(14,165,233,0.95), rgba(245,158,11,0.95));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          position: relative;
        }

        .bn-subtitle::after {
          content: "";
          display: block;
          height: 2px;
          width: 72%;
          margin: 10px auto 0;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(58,157,99,0.7), rgba(14,165,233,0.7), rgba(245,158,11,0.7), transparent);
          opacity: 0.9;
        }

        .bn-btn-login {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--bn-primary), var(--bn-primary-light));
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(45, 122, 78, 0.3);
          position: relative;
          overflow: hidden;
          animation: bn-fadeIn 1s ease-out 0.7s both;
        }

        .bn-btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .bn-btn-login::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .bn-btn-login:hover::before { left: 100%; }
        .bn-btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(45, 122, 78, 0.4);
        }
        .bn-btn-login:active { transform: translateY(0); }

        .bn-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 2rem 0;
          color: var(--bn-text-secondary);
          font-size: 0.875rem;
          animation: bn-fadeIn 1s ease-out 0.9s both;
        }
        .bn-divider::before,
        .bn-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--bn-border);
        }

        .bn-social {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
          animation: bn-fadeIn 1s ease-out 1.1s both;
        }

        .bn-btn-social {
          padding: 0.875rem;
          background: var(--bn-bg-input);
          border: 1px solid var(--bn-border);
          border-radius: 12px;
          color: var(--bn-text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .bn-btn-social:hover {
          background: var(--bn-bg-card);
          border-color: var(--bn-primary-light);
          transform: translateY(-2px);
        }

        .bn-signup {
          text-align: center;
          color: var(--bn-text-secondary);
          font-size: 0.875rem;
          animation: bn-fadeIn 1s ease-out 1.3s both;
        }

        .bn-signup a {
          color: var(--bn-primary-light);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .bn-signup a:hover { color: var(--bn-accent-blue); }

        .bn-center {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Dev hint */
        .bn-dev {
          position: absolute;
          left: 12px;
          top: 12px;
          z-index: 5;
        }
        .bn-dev-btn {
          height: 36px;
          width: 36px;
          border-radius: 999px;
          border: 1px solid var(--bn-border);
          background: rgba(20, 27, 35, 0.8);
          color: var(--bn-text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .bn-dev-btn:hover {
          color: var(--bn-text-primary);
          border-color: var(--bn-primary-light);
          transform: translateY(-1px);
        }
        .bn-dev-pop {
          margin-top: 10px;
          width: 300px;
          border-radius: 16px;
          border: 1px solid var(--bn-border);
          background: rgba(20, 27, 35, 0.95);
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
          padding: 12px;
        }
        .bn-dev-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }
        .bn-dev-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--bn-text-primary);
        }
        .bn-dev-sub {
          margin-top: 4px;
          font-size: 12px;
          color: var(--bn-text-secondary);
          line-height: 1.3;
        }
        .bn-dev-close {
          height: 32px;
          width: 32px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: var(--bn-text-secondary);
          cursor: pointer;
        }
        .bn-dev-close:hover {
          background: rgba(148,163,184,0.12);
          color: var(--bn-text-primary);
        }
        .bn-dev-host {
          margin-top: 10px;
          border-radius: 12px;
          background: rgba(28,38,49,0.9);
          border: 1px solid var(--bn-border);
          padding: 10px 12px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 12px;
          color: var(--bn-text-primary);
          user-select: all;
        }
        .bn-dev-path {
          margin-top: 8px;
          font-size: 11px;
          color: var(--bn-text-secondary);
        }

        @media (max-width: 640px) {
          .bn-card { padding: 2.25rem 1.25rem; }

          .bn-h1 { font-size: 2.2rem; }
          .bn-social { grid-template-columns: 1fr; }
          .bn-container { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
