import { Module } from '@nestjs/common';
import { CashRegisterController } from './cash-register.controller.js';
import { CashRegisterService } from './cash-register.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [CashRegisterController],
  providers: [CashRegisterService],
})
export class CashRegisterModule {}
