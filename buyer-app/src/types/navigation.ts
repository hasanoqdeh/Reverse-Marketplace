export type AuthStackParamList = {
  PhoneInput: undefined;
  OTP: {
    phone: string;
  };
};

export type AppTabParamList = {
  Home: undefined;
  Requests: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  App: undefined;
};
