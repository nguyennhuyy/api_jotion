export interface GeneratorOtp {
  email: string;
  type: string;
}

export interface OtpEntity extends GeneratorOtp {
  otp: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HasOtp extends GeneratorOtp {
  otp: string;
}
