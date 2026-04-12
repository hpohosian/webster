import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from './entities/password-reset.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PasswordResetsService {
  constructor(
    @InjectRepository(PasswordReset)
    private resetRepo: Repository<PasswordReset>,
  ) {}

  async deleteUserTokens(user: User) {
    await this.resetRepo.delete({ user: { id: user.id } });
  }

  async create(user: User, tokenHash: string, expiresAt: Date) {
    const reset = this.resetRepo.create({
      user,
      tokenHash,
      expiresAt,
    });

    return this.resetRepo.save(reset);
  }

  async findByHash(tokenHash: string) {
    return this.resetRepo.findOne({
      where: { tokenHash },
      relations: ['user'],
    });
  }

  async markUsed(reset: PasswordReset) {
    reset.used = true;
    return this.resetRepo.save(reset);
  }
}
