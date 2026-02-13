"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhookEvent = exports.getPaymentIntent = exports.confirmPaymentIntent = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Validate Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
// Initialize Stripe client
const stripe = new stripe_1.default(STRIPE_SECRET_KEY, {
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
const createPaymentIntent = (amount_1, ...args_1) => __awaiter(void 0, [amount_1, ...args_1], void 0, function* (amount, currency = 'usd', orderId) {
    try {
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: {
                order_id: orderId,
            },
            // Add any additional payment method types if needed
            payment_method_types: ['card'],
        });
        return paymentIntent;
    }
    catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
});
exports.createPaymentIntent = createPaymentIntent;
/**
 * Confirm a payment intent
 * @param paymentIntentId - Payment intent ID
 * @param paymentMethodId - Payment method ID
 * @returns Confirmed payment intent object
 */
const confirmPaymentIntent = (paymentIntentId, paymentMethodId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentIntent = yield stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethodId,
        });
        return paymentIntent;
    }
    catch (error) {
        console.error('Error confirming payment intent:', error);
        throw error;
    }
});
exports.confirmPaymentIntent = confirmPaymentIntent;
/**
 * Get payment intent by ID
 * @param paymentIntentId - Payment intent ID
 * @returns Payment intent object
 */
const getPaymentIntent = (paymentIntentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentIntent = yield stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    }
    catch (error) {
        console.error('Error retrieving payment intent:', error);
        throw error;
    }
});
exports.getPaymentIntent = getPaymentIntent;
/**
 * Handle Stripe webhook events
 * @param payload - Webhook payload
 * @param sig - Webhook signature
 * @returns Event object
 */
const handleWebhookEvent = (payload, sig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
        if (!STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
        }
        const event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
        return event;
    }
    catch (error) {
        console.error('Error handling webhook event:', error);
        throw error;
    }
});
exports.handleWebhookEvent = handleWebhookEvent;
exports.default = stripe;
