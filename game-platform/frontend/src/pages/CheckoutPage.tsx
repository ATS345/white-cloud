import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Initialize Stripe with public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CartItem {
  id: number;
  game_id: number;
  title: string;
  price: number;
  quantity: number;
  cover_image: string;
}

const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const cart = JSON.parse(storedCart);
      setCartItems(cart);
    } else {
      // Redirect to cart if empty
      window.location.href = '/cart';
    }
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create order in backend
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/orders`, {
        items: cartItems.map(item => ({
          game_id: item.game_id,
          quantity: item.quantity
        }))
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const order = response.data;
      setOrderId(order.id);

      // Initialize Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // For demo purposes, we'll directly confirm payment with backend
      // In a real app, you would use Stripe Elements to collect card details
      // and create a payment method
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${order.id}/pay`, {
        payment_method_id: 'demo_payment_method',
        payment_intent_id: order.payment_intent_id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Clear cart
      localStorage.removeItem('cart');
      setSuccess(true);
    } catch (err) {
      console.error('Payment error:', err);
      const error = err as { message?: string };
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-secondary-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-secondary-800 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-secondary-300 mb-6">Your order has been placed successfully.</p>
            <p className="text-secondary-300 mb-8">Order ID: {orderId}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/" className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition duration-300">
                Back to Home
              </a>
              <a href="/games" className="px-6 py-2 bg-secondary-700 hover:bg-secondary-600 rounded-lg transition duration-300">
                Browse More Games
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="max-w-3xl mx-auto">
          <div className="bg-secondary-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b border-secondary-700 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-secondary-400 text-sm">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-secondary-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total</span>
                <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Payment Information</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            <form onSubmit={handlePayment}>
              {/* In a real app, you would use Stripe Elements here */}
              {/* For this demo, we'll use a simple form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-secondary-300 mb-1">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="4242 4242 4242 4242"
                    readOnly
                    defaultValue="4242 4242 4242 4242"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-secondary-300 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      id="expiry"
                      className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="12/24"
                      readOnly
                      defaultValue="12/24"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-secondary-300 mb-1">CVC</label>
                    <input
                      type="text"
                      id="cvc"
                      className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="123"
                      readOnly
                      defaultValue="123"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition duration-300 font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Complete Payment'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;