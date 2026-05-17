export type AuthStackParamList = {
  PhoneInput: undefined;
  OTP: {
    phone: string;
  };
};

export type BuyerTabParamList = {
  Home: undefined;
  NewRequest: undefined;
  Requests: undefined;
};

export type MerchantTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  MyBids: undefined;
  Chat: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  ProfileSetup: undefined;
  App: undefined;
  CreateRequest: undefined;
  RequestDetail: { requestId: string };
  SubmitBid: { requestId: string; requestTitle: string };
  BidDetail: { bidId: string };
  RequestBids: { requestId: string; requestTitle: string };
  ChatRoom: { roomId: string; roomName: string };
  MerchantStore: { merchantId: string };
  RateTransaction: { bidId: string; revieweeId: string; revieweeType: 'MERCHANT' | 'BUYER'; revieweeName: string };
  MerchantSetup: undefined;
  Notifications: undefined;
  Profile: undefined;
};
