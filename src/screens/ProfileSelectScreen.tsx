import { useState } from 'react';
import type { ChildProfile } from '../hooks/useProfiles';
import { allThemes, type ThemeId } from '../data/themes';

interface ProfileSelectScreenProps {
  profiles: ChildProfile[];
  onSelect: (profile: ChildProfile) => void;
  onAddProfile: (name: string, pin: string, theme: ThemeId) => ChildProfile;
  onRemoveProfile: (id: string) => void;
  onUpdateProfile: (id: string, updates: Partial<Pick<ChildProfile, 'name' | 'pin'>>) => void;
  verifyPin: (id: string, pin: string) => boolean;
}

type Mode =
  | { type: 'select' }
  | { type: 'pin'; profile: ChildProfile }
  | { type: 'create'; step: 'name' | 'theme' | 'pin' | 'confirm' }
  | { type: 'manage' };

const PLANET_COLORS = ['#CD7F32', '#B0B0B0', '#4FC3F7', '#81C784', '#CE93D8', '#FF8A65', '#FFD54F', '#4DB6AC'];

export default function ProfileSelectScreen({
  profiles, onSelect, onAddProfile, onRemoveProfile, onUpdateProfile, verifyPin,
}: ProfileSelectScreenProps) {
  const [mode, setMode] = useState<Mode>({ type: 'select' });
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [pinError, setPinError] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [createError, setCreateError] = useState('');
  const [newTheme, setNewTheme] = useState<ThemeId>('space');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // -- PIN PAD --
  const handlePinDigit = (digit: string) => {
    if (mode.type !== 'pin') return;
    const next = [...pinDigits, digit];
    setPinDigits(next);
    setPinError(false);

    if (next.length === 4) {
      const pin = next.join('');
      if (verifyPin(mode.profile.id, pin)) {
        onSelect(mode.profile);
      } else {
        setPinError(true);
        setTimeout(() => {
          setPinDigits([]);
          setPinError(false);
        }, 600);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinDigits(prev => prev.slice(0, -1));
    setPinError(false);
  };

  // -- CREATE FLOW --
  const startCreate = () => {
    setNewName('');
    setNewPin('');
    setConfirmPin('');
    setNewTheme('space');
    setCreateError('');
    setMode({ type: 'create', step: 'theme' });
  };

  const submitName = () => {
    if (newName.trim().length === 0) {
      setCreateError('Please enter a name');
      return;
    }
    setCreateError('');
    setMode({ type: 'create', step: 'pin' });
  };

  const submitPin = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setCreateError('PIN must be 4 digits');
      return;
    }
    setCreateError('');
    setMode({ type: 'create', step: 'confirm' });
  };

  const submitConfirm = () => {
    if (confirmPin !== newPin) {
      setCreateError("PINs don't match — try again");
      setConfirmPin('');
      return;
    }
    const profile = onAddProfile(newName.trim(), newPin, newTheme);
    onSelect(profile);
  };

  // -- RENDER --

  // PIN pad screen
  if (mode.type === 'pin') {
    return (
      <div style={containerStyle}>
        <button onClick={() => { setMode({ type: 'select' }); setPinDigits([]); }} style={backBtn}>
          ← Back
        </button>

        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
            background: `radial-gradient(circle at 35% 35%, ${PLANET_COLORS[profiles.indexOf(mode.profile) % PLANET_COLORS.length]}cc, ${PLANET_COLORS[profiles.indexOf(mode.profile) % PLANET_COLORS.length]}66)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
          }}>
            {mode.profile.name[0].toUpperCase()}
          </div>
          <h2 style={titleStyle}>{mode.profile.name}</h2>
          <p style={{ color: '#B0BEC5', fontSize: 14, marginBottom: 24 }}>Enter PIN to continue</p>

          {/* PIN dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: 20, height: 20, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                background: i < pinDigits.length
                  ? (pinError ? '#FF6B6B' : '#4FC3F7')
                  : 'transparent',
                transition: 'all 0.15s',
                animation: pinError ? 'shake 0.4s ease-out' : undefined,
              }} />
            ))}
          </div>

          {/* Number pad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 64px)', gap: 12, justifyContent: 'center' }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map(d => (
              <button
                key={d || 'empty'}
                onClick={() => d === '⌫' ? handlePinBackspace() : d ? handlePinDigit(d) : undefined}
                disabled={!d}
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  border: d ? '2px solid rgba(255,255,255,0.15)' : 'none',
                  background: d ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: '#fff', fontSize: d === '⌫' ? 20 : 24,
                  fontWeight: 'bold', cursor: d ? 'pointer' : 'default',
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>
      </div>
    );
  }

  // Create flow
  if (mode.type === 'create') {
    return (
      <div style={containerStyle}>
        <button onClick={() => setMode({ type: 'select' })} style={backBtn}>
          ← Back
        </button>

        <div style={{ textAlign: 'center', marginTop: 80, padding: '0 32px' }}>
          <h2 style={titleStyle}>
            {mode.step === 'name' && '👨‍🚀 New Explorer'}
            {mode.step === 'theme' && '🎨 Pick a Theme'}
            {mode.step === 'pin' && '🔒 Set a PIN'}
            {mode.step === 'confirm' && '🔒 Confirm PIN'}
          </h2>
          <p style={{ color: '#B0BEC5', fontSize: 14, marginBottom: 24 }}>
            {mode.step === 'name' && "What is the reader's name?"}
            {mode.step === 'theme' && 'Choose an adventure!'}
            {mode.step === 'pin' && 'Choose a 4-digit parent PIN'}
            {mode.step === 'confirm' && 'Enter the PIN again to confirm'}
          </p>

          {mode.step === 'name' && (
            <>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Name"
                maxLength={20}
                autoFocus
                style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && submitName()}
              />
              <br />
              <button onClick={submitName} style={primaryBtn}>Next →</button>
            </>
          )}

          {mode.step === 'theme' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
                {allThemes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setNewTheme(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', borderRadius: 16,
                      border: newTheme === t.id ? `3px solid ${t.accentColor}` : '3px solid rgba(255,255,255,0.1)',
                      background: newTheme === t.id ? `${t.accentColor}15` : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: t.bgGradient,
                      border: `2px solid ${t.accentColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                    }}>
                      {t.titleEmojis[0]}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: t.accentColor, fontSize: 16, fontWeight: 'bold', fontFamily: "'Nunito', sans-serif" }}>
                        {t.name}
                      </div>
                      <div style={{ color: '#78909C', fontSize: 12 }}>
                        {t.unitNames.slice(0, 3).join(', ')}...
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setCreateError(''); setMode({ type: 'create', step: 'name' }); }}
                style={{ ...primaryBtn, marginTop: 20 }}
              >
                Next →
              </button>
            </>
          )}

          {mode.step === 'pin' && (
            <>
              <input
                type="tel"
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4-digit PIN"
                maxLength={4}
                autoFocus
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: 12, fontSize: 28 }}
                onKeyDown={e => e.key === 'Enter' && submitPin()}
              />
              <br />
              <button onClick={submitPin} style={primaryBtn}>Next →</button>
              <button
                onClick={() => {
                  setNewPin('');
                  const profile = onAddProfile(newName.trim(), '', newTheme);
                  onSelect(profile);
                }}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.4)', fontSize: 12,
                  fontFamily: "'Nunito', sans-serif",
                  cursor: 'pointer', marginTop: 12,
                  textDecoration: 'underline',
                }}
              >
                Skip — no PIN needed
              </button>
            </>
          )}

          {mode.step === 'confirm' && (
            <>
              <input
                type="tel"
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Confirm PIN"
                maxLength={4}
                autoFocus
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: 12, fontSize: 28 }}
                onKeyDown={e => e.key === 'Enter' && submitConfirm()}
              />
              <br />
              <button onClick={submitConfirm} style={primaryBtn}>🚀 Launch!</button>
            </>
          )}

          {createError && (
            <p style={{ color: '#FF6B6B', fontSize: 14, marginTop: 12 }}>{createError}</p>
          )}
        </div>
      </div>
    );
  }

  // Manage profiles
  if (mode.type === 'manage') {
    return (
      <div style={containerStyle}>
        <button onClick={() => { setMode({ type: 'select' }); setEditingId(null); }} style={backBtn}>
          ← Back
        </button>

        <div style={{ textAlign: 'center', marginTop: 40, padding: '0 24px' }}>
          <h2 style={titleStyle}>⚙️ Manage Profiles</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {profiles.map((p, i) => (
              <div key={p.id} style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 16,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: `radial-gradient(circle at 35% 35%, ${PLANET_COLORS[i % PLANET_COLORS.length]}cc, ${PLANET_COLORS[i % PLANET_COLORS.length]}66)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: '#fff',
                }}>{p.name[0].toUpperCase()}</div>

                {editingId === p.id ? (
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => {
                      if (editName.trim()) onUpdateProfile(p.id, { name: editName.trim() });
                      setEditingId(null);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        if (editName.trim()) onUpdateProfile(p.id, { name: editName.trim() });
                        setEditingId(null);
                      }
                    }}
                    autoFocus
                    style={{ ...inputStyle, margin: 0, flex: 1, fontSize: 16, padding: '6px 12px' }}
                  />
                ) : (
                  <span style={{ color: '#fff', fontSize: 16, flex: 1, textAlign: 'left' }}>{p.name}</span>
                )}

                <button
                  onClick={() => { setEditingId(p.id); setEditName(p.name); }}
                  style={smallBtn}
                >✏️</button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${p.name}'s profile and all their progress?`)) {
                      onRemoveProfile(p.id);
                    }
                  }}
                  style={{ ...smallBtn, color: '#FF6B6B' }}
                >🗑️</button>
              </div>
            ))}
          </div>

          {profiles.length === 0 && (
            <p style={{ color: '#78909C', marginTop: 24 }}>No profiles yet</p>
          )}
        </div>
      </div>
    );
  }

  // Main selection screen
  // If no profiles exist, show theme picker as the landing page
  if (profiles.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', marginTop: 40, padding: '0 24px' }}>
          <h1 style={{
            ...titleStyle, fontSize: 32, marginBottom: 4,
            color: '#fff',
          }}>
            📚 Learn to Read!
          </h1>
          <p style={{ color: '#B0BEC5', fontSize: 15, marginBottom: 32 }}>
            Pick an adventure to get started
          </p>

          {/* Theme cards as main landing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360, margin: '0 auto' }}>
            {allThemes.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setNewTheme(t.id);
                  setNewName('');
                  setNewPin('');
                  setConfirmPin('');
                  setCreateError('');
                  setMode({ type: 'create', step: 'name' });
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 20px', borderRadius: 20,
                  border: `3px solid ${t.accentColor}44`,
                  background: t.bgGradient,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
                  background: `radial-gradient(circle at 35% 35%, ${t.unitColors[0]}cc, ${t.unitColors[0]}66)`,
                  boxShadow: `0 4px 20px ${t.accentColor}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {t.titleEmojis[0]}
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{
                    color: t.accentColor, fontSize: 20, fontWeight: 'bold',
                    fontFamily: "'Nunito', sans-serif",
                  }}>
                    {t.name}
                  </div>
                  <div style={{ color: '#B0BEC5', fontSize: 12, marginTop: 2 }}>
                    {t.unitNames.slice(0, 3).join(' · ')}...
                  </div>
                </div>
                <span style={{ fontSize: 20, color: t.accentColor }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Existing profiles — show profile cards + add new
  return (
    <div style={containerStyle}>
      <button
        onClick={() => setMode({ type: 'manage' })}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'none', border: 'none',
          color: '#78909C', fontSize: 24, cursor: 'pointer',
        }}
      >⚙️</button>

      <div style={{ textAlign: 'center', marginTop: 60, padding: '0 24px' }}>
        <h1 style={{
          ...titleStyle, fontSize: 28, marginBottom: 4,
          color: '#fff',
        }}>
          📚 Who is reading today?
        </h1>
        <p style={{ color: '#B0BEC5', fontSize: 14, marginBottom: 32 }}>
          Tap your name to start
        </p>

        {/* Profile cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginBottom: 32 }}>
          {profiles.map((p, i) => {
            const pTheme = allThemes.find(t => t.id === p.theme) || allThemes[0];
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (!p.pin) { onSelect(p); return; }
                  setPinDigits([]); setPinError(false); setMode({ type: 'pin', profile: p });
                }}
                style={{
                  width: 130, padding: '20px 12px',
                  borderRadius: 20, border: `3px solid ${pTheme.accentColor}44`,
                  background: pTheme.bgGradient,
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 8, transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${pTheme.unitColors[i % pTheme.unitColors.length]}cc, ${pTheme.unitColors[i % pTheme.unitColors.length]}66)`,
                  boxShadow: `0 4px 20px ${pTheme.accentColor}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: '#fff', fontWeight: 'bold',
                }}>
                  {p.name[0].toUpperCase()}
                </div>
                <span style={{ color: '#fff', fontSize: 16, fontFamily: "'Nunito', sans-serif" }}>
                  {p.name}
                </span>
                <span style={{ color: pTheme.accentColor, fontSize: 11, fontFamily: "'Nunito', sans-serif" }}>
                  {pTheme.titleEmojis[0]} {pTheme.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add profile — goes to theme picker first */}
        <button onClick={startCreate} style={{
          background: 'linear-gradient(135deg, #4FC3F7, #2196F3)',
          border: 'none', borderRadius: 16, color: '#fff',
          padding: '14px 28px', cursor: 'pointer', fontSize: 16,
          fontWeight: 'bold', fontFamily: "'Nunito', sans-serif",
          boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
        }}>
          + Add New Explorer
        </button>
      </div>
    </div>
  );
}

// -- Shared styles --

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a3e 50%, #0a0a2e 100%)',
  position: 'relative',
};

const backBtn: React.CSSProperties = {
  position: 'absolute', top: 20, left: 20,
  background: 'rgba(255,255,255,0.1)', border: 'none',
  borderRadius: 10, color: '#B0BEC5', padding: '8px 16px',
  cursor: 'pointer', fontSize: 14,
};

const titleStyle: React.CSSProperties = {
  color: '#FFD700', fontFamily: "'Nunito', sans-serif",
  fontSize: 24, marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 12, color: '#fff', padding: '12px 16px',
  fontSize: 20, fontFamily: "'Nunito', sans-serif",
  outline: 'none', width: '100%', maxWidth: 280,
  marginBottom: 16,
};

const primaryBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
  border: 'none', borderRadius: 16, color: '#fff',
  padding: '14px 32px', cursor: 'pointer', fontSize: 18,
  fontWeight: 'bold', fontFamily: "'Nunito', sans-serif",
  boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
  marginTop: 8,
};

const smallBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: 'none', borderRadius: 8, padding: '6px 10px',
  cursor: 'pointer', fontSize: 16,
};
