import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Validate Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

// Initialize Stripe client
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover', // Use the version expected by @types/stripe
  typescript: true,
});

/**
 * Create a payment intent for an order
 * @param amount - Amount in cents
 * @param currency - Currency code (default: 'usd')
 * @param orderId - Order ID
 * @returns Payment intent object
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  orderId: string
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        order_id: orderId,
      },
      // Add any additional payment method types if needed
      payment_method_types: ['card'],
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirm a payment intent
 * @param paymentIntentId - Payment intent ID
 * @param paymentMethodId - Payment method ID
 * @returns Confirmed payment intent object
 */
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId: string
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw error;
  }
};

/**
 * Get payment intent by ID
 * @param paymentIntentId - Payment intent ID
 * @returns Payment intent object
 */
export const getPaymentIntent = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

/**
 * Handle Stripe webhook events
 * @param payload - Webhook payload
 * @param sig - Webhook signature
 * @returns Event object
 */
export const handleWebhookEvent = async (payload: string, sig: string) => {
  try {
    const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
    }
    
    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      STRIPE_WEBHOOK_SECRET
    );

    return event;
  } catch (error) {
    console.error('Error handling webhook event:', error);
    throw error;
  }
};

export default stripe;