import React from 'react';

/**
 * Shown when Supabase environment variables are not yet configured.
 * Guides developers to add them — either in Replit Secrets (local dev)
 * or in the Vercel dashboard (production).
 */
export const SetupScreen: React.FC = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', padding: '2rem',
    textAlign: 'center', fontFamily: 'system-ui, sans-serif',
    background: '#0f1117', color: '#f8fafc',
  }}>
    <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>🔑</div>
    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
      Supabase credentials required
    </h2>
    <p style={{ color: '#94a3b8', maxWidth: '500px', lineHeight: 1.7, marginBottom: '2rem' }}>
      This app needs a Supabase project for auth and matchmaking.
      Add the two variables below, then restart / redeploy.
    </p>

    {/* Variables */}
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
      padding: '1.25rem 1.5rem', maxWidth: '460px', width: '100%',
      textAlign: 'left', marginBottom: '2rem',
    }}>
      {[
        { key: 'VITE_SUPABASE_URL', hint: 'Project URL — Settings → API → Project URL' },
        { key: 'VITE_SUPABASE_PUBLISHABLE_KEY', hint: 'Anon key — Settings → API → anon public' },
      ].map(({ key, hint }) => (
        <div key={key} style={{ marginBottom: '1rem' }}>
          <div style={{
            fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700,
            color: '#93c5fd', marginBottom: '0.2rem',
          }}>{key}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{hint}</div>
        </div>
      ))}
    </div>

    {/* Where to add them */}
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
      maxWidth: '460px', width: '100%', marginBottom: '1.5rem',
    }}>
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: '10px',
        padding: '1rem', textAlign: 'left',
      }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>🔒</div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>Local dev (Replit)</div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
          Add to <strong style={{ color: '#94a3b8' }}>Secrets</strong> in the left sidebar,
          then restart the workflow.
        </div>
      </div>
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: '10px',
        padding: '1rem', textAlign: 'left',
      }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>▲</div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>Production (Vercel)</div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
          Add to <strong style={{ color: '#94a3b8' }}>Project → Settings →
          Environment Variables</strong> and redeploy.
        </div>
      </div>
    </div>

    <p style={{ fontSize: '0.78rem', color: '#334155' }}>
      Both values are in your Supabase project under <strong style={{ color: '#475569' }}>Settings → API</strong>.
    </p>
  </div>
);
