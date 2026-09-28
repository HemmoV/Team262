'use client';

/* eslint-disable @next/next/no-img-element */
import { useFormState, useFormStatus } from 'react-dom';
import { login } from '../actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary btn-block">
      {pending ? 'Bezig…' : 'Inloggen'}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useFormState(login, null);

  return (
    <main className="login-shell">
      <div className="login-box">
        <div className="logo" style={{ justifyContent: 'center' }}>
          <img src="/img/logo-white.svg" alt="Team262" />
        </div>
        <p className="text-center">Beheer van de shop</p>
        {state?.error && <div className="flash flash-error">{state.error}</div>}
        <form action={action}>
          <div className="form-field">
            <label htmlFor="password">Wachtwoord</label>
            <input id="password" type="password" name="password" required autoFocus />
          </div>
          <Submit />
        </form>
      </div>
    </main>
  );
}
