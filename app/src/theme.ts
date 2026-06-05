export const Colors = {
  primary: '#1877F2',
  primaryLight: '#E7F3FF',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  feedBackground: '#F0F2F5',
  divider: '#E4E6EA',

  textPrimary: '#050505',
  textSecondary: '#65676B',
  textPlaceholder: '#BCC0C4',
  textOnPrimary: '#FFFFFF',

  success: '#42B72A',
  successLight: '#F0FDF4',
  error: '#E41E3F',
  errorLight: '#FFF0F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',

  badge: '#E41E3F',
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
};

// Standard button shapes — use these in every screen's StyleSheet
export const Btn = {
  // Blue filled — primary actions
  primary: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center' as const,
  },
  // White with border — secondary / cancel actions ("low white")
  secondary: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'center' as const,
  },
  // Danger outline — destructive actions (withdraw, logout)
  danger: {
    backgroundColor: Colors.errorLight,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center' as const,
  },
  // Small pill — inline chip-style buttons
  pill: {
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
  },
};

export const BtnText = {
  primary: { fontSize: 14, fontWeight: '700' as const, color: Colors.textOnPrimary },
  secondary: { fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary },
  danger: { fontSize: 14, fontWeight: '700' as const, color: Colors.error },
};

// Standard card container
export const Card = {
  base: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
  },
};
