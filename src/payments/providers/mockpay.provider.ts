import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
} from './payment-provider.interface.js';

@Injectable()
export class MockPayProvider implements PaymentProvider {
  private readonly baseUrl: string;
  private readonly secretKey: string;
  

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>(
      'MOCKPAY_BASE_URL',
    );

    this.secretKey = this.configService.getOrThrow<string>(
      'MOCKPAY_SECRET_KEY',
    );
      console.log(
    'MockPay:',
    this.baseUrl,
    `secret carregada (${this.secretKey.length} caracteres)`,
  );
  }

  async createPayment(
    input: CreatePaymentInput,
  ): Promise<CreatePaymentResult> {
    console.log(
  'URL do MockPay:',
  `${this.baseUrl}/api/v1/payments`,
);
    const response = await fetch(
      `${this.baseUrl}/api/v1/payments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: input.amount,
          currency: input.currency,
          metadata: input.metadata,
        }),
      },
    );

console.log('URL final:', response.url);
console.log('MockPay status:', response.status);
   const responseBody = await response.text();

console.log('MockPay status:', response.status);
console.log('MockPay response:', responseBody);

if (!response.ok) {
  throw new Error(
    `Erro ao criar pagamento no MockPay: ${response.status} ${responseBody}`,
  );
}

let data: {
  id_transaccion: string;
  checkout_url: string;
};

try {
  data = JSON.parse(responseBody);
} catch {
  throw new Error(
    `MockPay retornou uma resposta que não é JSON: ${responseBody}`,
  );
}

    return {
  transactionId: data.id_transaccion,
  checkoutUrl: data.checkout_url,
};
  }
}

