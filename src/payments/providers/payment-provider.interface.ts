export interface CreatePaymentInput {
  amount: number;
  currency: string;
  metadata: {
    order_id: string;
  };
}

export interface CreatePaymentResult {
  transactionId: string;
  checkoutUrl: string;
}

export interface PaymentProvider {
  createPayment(
    input: CreatePaymentInput,
  ): Promise<CreatePaymentResult>;
}