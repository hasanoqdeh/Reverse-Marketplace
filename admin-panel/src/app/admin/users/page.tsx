// Users Management Page

'use client';

import { AdminLayout } from '../../../components/layout/AdminLayout';
import { UserManagement } from '../../../components/users/UserManagement';

export default function UsersPage() {
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
}
