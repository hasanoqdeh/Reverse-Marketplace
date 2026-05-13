// Security Alerts Page

import { AdminLayout } from '../../../../components/layout/AdminLayout';
import { SecurityAlertsManagement } from '../../../../components/security/SecurityAlertsManagement';

export default function SecurityAlertsPage() {
  return (
    <AdminLayout>
      <SecurityAlertsManagement />
    </AdminLayout>
  );
}
