'use strict';

/**
 * Middleware factory: requires the user to have one of the specified top-level roles.
 * Must run after `authenticate`.
 *
 * Usage: router.use(requireRole('ADMIN'))
 *        router.post('/foo', requireRole('BUYER', 'MERCHANT'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.', error: 'UNAUTHORIZED' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
        error: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
}

/**
 * Middleware factory: requires the admin user to have one of the specified sub-roles.
 * Must run after `authenticate` and `requireRole('ADMIN')`.
 *
 * Usage: router.delete('/admins/:id', requireAdminSubRole('SUPER_ADMIN'), handler)
 */
function requireAdminSubRole(...subRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.', error: 'UNAUTHORIZED' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required.',
        error: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    if (!subRoles.includes(req.user.adminSubRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required admin level: ${subRoles.join(' or ')}.`,
        error: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
}

module.exports = { requireRole, requireAdminSubRole };
