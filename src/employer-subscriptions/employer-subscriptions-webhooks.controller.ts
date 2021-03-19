import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmployerSubscriptionsService } from './employer-subscriptions.service';
import ResponseHandler from '../common/ResponseHandler';

@ApiTags('Employer Subscriptions - Webhooks')
@Controller('/employer-subscriptions/webhooks')
export class EmployerSubscriptionsWebhooksController {
  constructor(private readonly employerSubscriptionsService: EmployerSubscriptionsService) {}

  @Post('payment-succeeded')
  async paymentSucceeded(@Body() body) {
    const invoice = await body.data.object;

    if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
      const { data: subscription } = await this.employerSubscriptionsService.subscriptionInvoicePaymentSucceeded(invoice);

      return ResponseHandler.success(subscription, 'Invoice received successfully.');
    } else {
      return ResponseHandler.success(null);
    }
  }

  @Post('payment-failed')
  async paymentFailed(@Body() body) {
    const invoice = await body.data.object;

    if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
      await this.employerSubscriptionsService.subscriptionInvoicePaymentFailed(invoice);

      return ResponseHandler.success(null, 'Subscription canceled and downgraded plan to local until payment');
    } else {
      return ResponseHandler.success(null);
    }
  }
}
