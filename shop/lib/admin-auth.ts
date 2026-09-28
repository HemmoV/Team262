import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from './session';

export async function isAdmin() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

/** Gebruik bovenaan elke admin server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}
