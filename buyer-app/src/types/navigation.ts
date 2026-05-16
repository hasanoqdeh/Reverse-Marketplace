export type AuthStackParamList = {
  PhoneInput: undefined;
  OTP: {
    phone: string;
  };
};

export type BuyerTabParamList = {
  Home: undefined;
  Requests: undefined;
  Profile: undefined;
};

export type MerchantTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  MyBids: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  ProfileSetup: undefined;
  App: undefined;
};
