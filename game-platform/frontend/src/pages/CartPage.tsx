import React from 'react';
import Navbar from '../components/Navbar';
import Cart from '../components/Cart';

const CartPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
        <div className="max-w-3xl mx-auto">
          <Cart />
        </div>
      </div>
    </div>
  );
};

export default CartPage;