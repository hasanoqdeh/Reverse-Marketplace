// Audit Logs Page

import { AdminLayout } from '../../../components/layout/AdminLayout';
import { AuditLogsManagement } from '../../../components/audit/AuditLogsManagement';

export default function AuditLogsPage() {
  return (
    <AdminLayout>
      <AuditLogsManagement />
    </AdminLayout>
  );
}
