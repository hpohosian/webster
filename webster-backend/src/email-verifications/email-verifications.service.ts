import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from './entities/email-verification.entity';

@Injectable()
export class EmailVerificationsService {
  constructor(
    @InjectRepository(EmailVerification)
    private verificationRepository: Repository<EmailVerification>,
  ) {}

  async create(userId: string, code: string, expiresAt: Date) {
    const verification = this.verificationRepository.create({
      userId,
      code,
      expiresAt,
    });

    return this.verificationRepository.save(verification);
  }

  async findByUserId(userId: string) {
    return this.verificationRepository.findOne({
      where: { userId },
    });
  }

  async deleteByUserId(userId: string) {
    return this.verificationRepository.delete({ userId });
  }
}
