// Session Management Page

import { AdminLayout } from '../../../../components/layout/AdminLayout';
import { SessionManagement } from '../../../../components/security/SessionManagement';

export default function SessionManagementPage() {
  return (
    <AdminLayout>
      <SessionManagement />
    </AdminLayout>
  );
}
