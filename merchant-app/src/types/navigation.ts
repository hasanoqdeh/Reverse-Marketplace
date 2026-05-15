export type AuthStackParamList = {
  PhoneInput: undefined;
  OTP: {
    phone: string;
    otpExpiresAt?: string;
  };
};

export type MerchantTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  MyBids: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Merchant: undefined;
};
