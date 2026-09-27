import { useState } from 'react';
import { login, register } from '../api.js';
import { HudTop, HudBottom } from '../theme/Hud.jsx';
import { playSelect } from '../theme/sfx.js';
import { useTransition } from '../theme/transition.js';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const MIN_PASSWORD = 8;

// One form, two modes: sign in to an existing account or create a new one.
export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // login | register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';
  const transition = useTransition();

  // สลับ register ↔ login ก็ตัดฉากเหมือนเปลี่ยนหน้าอื่น ๆ
  function switchMode() {
    const next = isRegister ? 'login' : 'register';
    playSelect();
    transition(() => {
      setMode(next);
      setPassword('');
      setConfirm('');
      setError('');
    }, next);
  }

  function validate() {
    if (!isRegister) return '';
    if (!USERNAME_RE.test(username.trim())) {
      return 'Username must be 3-30 characters: letters, numbers or underscore.';
    }
    if (password.length < MIN_PASSWORD) {
      return `Password must be at least ${MIN_PASSWORD} characters.`;
    }
    if (password !== confirm) return 'The two passwords do not match.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);

    setError('');
    setBusy(true);
    playSelect();
    try {
      const action = isRegister ? register : login;
      const { token, username: name, role } = await action(username.trim(), password);
      onLogin({ token, username: name, role });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <HudTop left="PERSONA // DESK GEAR" right="MEMBER ACCESS" />
      <form className="panel login cut" key={mode} onSubmit={handleSubmit} noValidate>
        <span className="wordmark wordmark-lg">persona</span>
        <h1>{isRegister ? 'Create your account' : 'Sign in to start shopping'}</h1>

        <label className="field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
          {isRegister && (
            <small>3-30 characters: letters, numbers or underscore.</small>
          )}
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
          />
          {isRegister && <small>At least {MIN_PASSWORD} characters.</small>}
        </label>

        {isRegister && (
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button className="key key-wide sfx" type="submit" disabled={busy}>
          {busy
            ? isRegister
              ? 'Creating account…'
              : 'Signing in…'
            : isRegister
              ? 'Create account'
              : 'Sign in'}
        </button>

        <p className="switch">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" className="link" onClick={switchMode}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </p>

        {!isRegister && <p className="hint">Demo account: user1 / 1234</p>}
      </form>

      <HudBottom hints={[['TAB', 'MOVE'], ['ENTER', 'CONFIRM']]} />
    </div>
  );
}
