import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { MockPayProvider } from './providers/mockpay.provider.js';
import { PAYMENT_PROVIDER } from './providers/payment-provider.token.js';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MockPayProvider,
    {
      provide: PAYMENT_PROVIDER,
      useExisting: MockPayProvider,
    },
  ],
  exports: [
    PaymentsService,
  ],
})
export class PaymentsModule {}