import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import {
  GeneratorOtp,
  HasOtp,
  OtpEntity,
} from './interfaces/constants.interface';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}
  generatorCode() {
    const otpDummy = '0123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += otpDummy.charAt(Math.floor(Math.random() * 10));
    }
    return otp;
  }

  async generatorOtp(data: GeneratorOtp) {
    console.log('data', data);
    const { email, type } = data;
    const options: OtpEntity = {
      email: '',
      type: '',
      otp: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    type && (options.type = type);
    email && (options.email = email);

    const otpExists = await this.prisma.generatorOtp.findFirst({
      where: options,
    });

    if (otpExists)
      return {
        status: 'exists',
        otp: otpExists,
      };

    const otp = this.generatorCode();
    options.otp = otp;
    options.createdAt = new Date();
    options.updatedAt = new Date();

    const newOtp = await this.prisma.generatorOtp.create({
      data: options,
    });
    return {
      status: 'new',
      data: newOtp,
    };
  }

  async hasOtp(data: HasOtp) {
    const { otp } = data;

    const otpData = await this.prisma.generatorOtp.findFirst({
      where: data,
    });

    return otpData.otp === otp;
  }

  async verify(data: HasOtp) {
    const { otp, email } = data;

    const otpData = await this.prisma.generatorOtp.findFirst({
      where: {
        otp,
        email,
      },
    });
    if (!otpData) return false;

    await this.prisma.generatorOtp.delete({
      where: {
        id: otpData.id,
      },
    });
    return otpData.otp === otp;
  }
}
