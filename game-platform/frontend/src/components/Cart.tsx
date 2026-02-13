import React, { useState, useEffect } from 'react';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface CartItem {
  id: number;
  game_id: number;
  title: string;
  price: number;
  quantity: number;
  cover_image: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (game: any) => {
    const existingItem = cartItems.find(item => item.game_id === game.id);
    if (existingItem) {
      // Update quantity if game already in cart
      setCartItems(cartItems.map(item => 
        item.game_id === game.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new game to cart
      const newItem: CartItem = {
        id: Date.now(),
        game_id: game.id,
        title: game.title,
        price: game.price,
        quantity: 1,
        cover_image: game.cover_image
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, change: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    // Redirect to checkout page
    // In a real app, this would create an order and redirect to payment
    console.log('Checkout', cartItems);
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-secondary-800 rounded-xl p-6 text-center">
        <p className="text-secondary-400 mb-4">Your cart is empty</p>
        <Link
          to="/games"
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition duration-300"
        >
          Browse Games
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-secondary-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Cart</h2>
        <button
          onClick={clearCart}
          className="text-red-400 hover:text-red-300 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center gap-4 border-b border-secondary-700 pb-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img
                src={item.cover_image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">{item.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 bg-secondary-700 hover:bg-secondary-600 rounded"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 bg-secondary-700 hover:bg-secondary-600 rounded"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 text-sm mt-1"
                  >
                    <FiTrash2 className="w-4 h-4 inline" /> Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-secondary-700 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium">Total</span>
          <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition duration-300 font-medium"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;