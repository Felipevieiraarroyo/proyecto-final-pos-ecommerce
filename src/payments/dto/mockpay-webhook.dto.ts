import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export enum MockPayWebhookEvent {
  PAYMENT_SUCCEEDED = 'payment.succeeded',
  PAYMENT_FAILED = 'payment.failed',
}

export class MockPayWebhookDto {
  @IsEnum(MockPayWebhookEvent)
  event: MockPayWebhookEvent;

  @IsString()
  id: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  failure_reason?: string | null;

  @IsObject()
  metadata: {
    order_id: string;
  };

  @IsString()
  created_at: string;
}