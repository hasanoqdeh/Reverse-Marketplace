// Phone number formatting utilities for Jordanian numbers

/**
 * Formats a local Jordanian phone number to international format +962XXXXXXXXX
 * @param phone - The phone number in any format (7XXXXXXXX, 07XXXXXXXX, or +962XXXXXXXXX)
 * @returns The formatted phone number in international format
 */
export function formatJordanianPhone(phone: string): string {
  const cleanRawPhone = phone.replace(/\D/g, '');
  
  if (phone.startsWith('+962')) {
    return phone;
  } else if (cleanRawPhone.startsWith('07') && cleanRawPhone.length === 10) {
    return `+962${cleanRawPhone.substring(1)}`;
  } else if (cleanRawPhone.startsWith('7') && cleanRawPhone.length === 9) {
    return `+962${cleanRawPhone}`;
  } else {
    return `+962${cleanRawPhone}`;
  }
}

/**
 * Validates if a phone number is a valid local Jordanian number
 * @param phone - The phone number to validate
 * @returns True if valid Jordanian number, false otherwise
 */
export function validateLocalJordanianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 9 && cleanPhone.startsWith('7');
}
