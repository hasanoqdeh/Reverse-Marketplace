import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^968[79]\d{7}$/, {
    message: 'Phone number must be a valid Oman number starting with +968 and followed by 7 or 9 and 7 digits',
  })
  phoneNumber: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^968[79]\d{7}$/, {
    message: 'Phone number must be a valid Oman number starting with +968 and followed by 7 or 9 and 7 digits',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  otp: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
