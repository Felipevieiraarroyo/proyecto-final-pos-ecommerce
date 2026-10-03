import { Module } from '@nestjs/common';
import { CashRegisterController } from './cash-register.controller.js';
import { CashRegisterService } from './cash-register.service.js';

@Module({
  controllers: [CashRegisterController],
  providers: [CashRegisterService]
})
export class CashRegisterModule {}
