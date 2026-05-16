'use strict';

const config = require('../../../config');
const logger = require('../../../utils/logger');

/**
 * SmsService — sends OTP codes via Twilio or logs to console in development.
 */
const SmsService = {
  /**
   * Send an OTP code to the given phone number.
   * @param {string} phone     E.164 formatted number (e.g. '+962790001234')
   * @param {string} otpCode   6-digit OTP string
   * @returns {Promise<{ success: boolean, messageId?: string }>}
   */
  async sendOtp(phone, otpCode) {
    const message = `Your Reverse Marketplace verification code is: ${otpCode}. Valid for ${config.otp.expiryMinutes} minutes. Do not share this code.`;
    return this.send(phone, message);
  },

  async send(phone, message) {
    const provider = config.sms.provider;

    if (provider === 'twilio') {
      return this._sendViaTwilio(phone, message);
    }

    // Console provider — development fallback
    return this._sendToConsole(phone, message);
  },

  async _sendViaTwilio(phone, message) {
    try {
      const twilio = require('twilio');
      const { accountSid, authToken, phoneNumber } = config.sms.twilio;

      if (!accountSid || !authToken || !phoneNumber) {
        logger.warn('Twilio credentials not configured — falling back to console');
        return this._sendToConsole(phone, message);
      }

      const client = twilio(accountSid, authToken);
      const result = await client.messages.create({
        body: message,
        from: phoneNumber,
        to: phone,
      });

      logger.info('SMS sent via Twilio', { phone: this._maskPhone(phone), messageId: result.sid });
      return { success: true, messageId: result.sid };
    } catch (err) {
      logger.error('Twilio SMS send failed', { phone: this._maskPhone(phone), error: err.message });
      return { success: false, error: err.message };
    }
  },

  _sendToConsole(phone, message) {
    // In development, print the OTP to console so developers can test without SMS
    logger.info(`[SMS-DEV] To: ${this._maskPhone(phone)} | Message: ${message}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 SMS (DEV) → ${phone}`);
    console.log(`   ${message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { success: true, messageId: `dev-${Date.now()}` };
  },

  /**
   * Mask phone for safe logging: +962790001234 → +96279****234
   */
  _maskPhone(phone) {
    if (!phone || phone.length < 6) return '***';
    return phone.slice(0, 6) + '****' + phone.slice(-3);
  },
};

module.exports = SmsService;
