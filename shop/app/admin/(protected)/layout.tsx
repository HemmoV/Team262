import { redirect } from 'next/navigation';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { isAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Beheer — Team262 Shop', robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect('/admin/login');

  return (
    <div className="admin-shell">
      <div className="container">
        <AdminTopbar />
        <div style={{ paddingBottom: 60 }}>{children}</div>
      </div>
    </div>
  );
}
