
import { isDbConnected } from '@/lib/db';
import AdminPage from './page';

export default function AdminLayout() {
    // This is a server component, so isDbConnected will have the correct server-side value.
    return <AdminPage dbConnected={isDbConnected} />;
}
