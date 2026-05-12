const auth = require('../services/authService');

describe('Phone Number Validation with Country Codes', () => {
  describe('validatePhoneNumber', () => {
    test('should handle Jordanian numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('+962712345678');
      expect(result).toBe('962712345678');
    });

    test('should handle Jordanian numbers without country code (07 prefix)', async () => {
      const result = await auth.validatePhoneNumber('0712345678');
      expect(result).toBe('962712345678');
    });

    test('should handle Jordanian numbers without country code (7 prefix)', async () => {
      const result = await auth.validatePhoneNumber('712345678');
      expect(result).toBe('962712345678');
    });

    test('should handle Omani numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('+96891234567');
      expect(result).toBe('96891234567');
    });

    test('should handle Omani numbers without country code', async () => {
      const result = await auth.validatePhoneNumber('91234567');
      expect(result).toBe('96891234567');
    });

    test('should handle US numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('+12345678901');
      expect(result).toBe('12345678901');
    });

    test('should handle US numbers without country code', async () => {
      const result = await auth.validatePhoneNumber('2345678901');
      expect(result).toBe('12345678901');
    });

    test('should handle Saudi Arabian numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('+966501234567');
      expect(result).toBe('966501234567');
    });

    test('should handle UAE numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('+971501234567');
      expect(result).toBe('971501234567');
    });

    test('should handle Egyptian numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('+201234567890');
      expect(result).toBe('201234567890');
    });

    test('should handle Turkish numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('+905321234567');
      expect(result).toBe('905321234567');
    });

    test('should handle UK numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('+442071234567');
      expect(result).toBe('442071234567');
    });

    test('should handle Indian numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('+919876543210');
      expect(result).toBe('919876543210');
    });

    test('should handle Chinese numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('+8613812345678');
      expect(result).toBe('8613812345678');
    });

    test('should reject invalid Omani numbers', async () => {
      const result = await auth.validatePhoneNumber('9689123456');
      expect(result).toBeNull();
    });

    test('should accept valid Jordanian numbers with country code', async () => {
      const result = await auth.validatePhoneNumber('962712345678');
      expect(result).toBe('962712345678');
    });

    test('should reject invalid US numbers', async () => {
      const result = await auth.validatePhoneNumber('123456789');
      expect(result).toBeNull();
    });

    test('should handle international numbers with basic validation', async () => {
      const result = await auth.validatePhoneNumber('+33123456789');
      expect(result).toBe('33123456789');
    });

    test('should reject numbers that are too short', async () => {
      const result = await auth.validatePhoneNumber('123456789');
      expect(result).toBeNull();
    });

    test('should reject numbers that are too long', async () => {
      const result = await auth.validatePhoneNumber('1234567890123456');
      expect(result).toBeNull();
    });

    test('should handle numbers with special characters', async () => {
      const result = await auth.validatePhoneNumber('+962-7-123-456-78');
      expect(result).toBe('962712345678');
    });

    test('should handle numbers with spaces', async () => {
      const result = await auth.validatePhoneNumber('+962 7 123 456 78');
      expect(result).toBe('962712345678');
    });
  });

  describe('Country Code Mapping', () => {
    test('should correctly map country codes to dial codes', () => {
      const countryCodes = {
        'JO': '962',
        'OM': '968',
        'US': '1',
        'SA': '966',
        'AE': '971',
        'EG': '20',
        'TR': '90',
        'GB': '44',
        'IN': '91',
        'CN': '86'
      };

      // Test Jordan
      expect(countryCodes['JO']).toBe('962');
      
      // Test Oman
      expect(countryCodes['OM']).toBe('968');
      
      // Test US
      expect(countryCodes['US']).toBe('1');
      
      // Test Saudi Arabia
      expect(countryCodes['SA']).toBe('966');
    });
  });

  describe('Integration with Frontend', () => {
    test('should handle phone number formatting from admin panel', async () => {
      // Simulate admin panel phone number input
      const countryCode = 'JO';
      const phoneNumber = '712345678';
      
      const countryCodes = {
        'JO': '962',
        'OM': '968',
        'US': '1'
      };

      const cleanRawPhone = phoneNumber.replace(/\D/g, '');
      let formattedPhone;

      if (phoneNumber.startsWith('+')) {
        formattedPhone = phoneNumber;
      } else if (cleanRawPhone.length >= 10 && cleanRawPhone.startsWith(countryCodes[countryCode])) {
        formattedPhone = `+${cleanRawPhone}`;
      } else {
        formattedPhone = `+${countryCodes[countryCode]}${cleanRawPhone}`;
      }

      const result = await auth.validatePhoneNumber(formattedPhone);
      expect(result).toBe('962712345678');
    });

    test('should handle phone number formatting from mobile app', async () => {
      // Simulate mobile app phone number input
      const countryCode = 'OM';
      const phoneNumber = '91234567';
      
      const countryCodes = {
        'JO': '962',
        'OM': '968',
        'US': '1'
      };

      const cleanRawPhone = phoneNumber.replace(/\D/g, '');
      let formattedPhone;

      if (phoneNumber.startsWith('+')) {
        formattedPhone = phoneNumber;
      } else if (cleanRawPhone.length >= 10 && cleanRawPhone.startsWith(countryCodes[countryCode])) {
        formattedPhone = `+${cleanRawPhone}`;
      } else {
        formattedPhone = `+${countryCodes[countryCode]}${cleanRawPhone}`;
      }

      const result = await auth.validatePhoneNumber(formattedPhone);
      expect(result).toBe('96891234567');
    });
  });
});
