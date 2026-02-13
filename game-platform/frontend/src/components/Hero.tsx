import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-secondary-900 text-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20gaming%20platform%20banner%20with%20dynamic%20game%20characters%20and%20vibrant%20colors%20dark%20background&image_size=landscape_16_9"
          alt="Gaming Platform Banner"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 via-secondary-900/80 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover Your Next <span className="text-primary-400">Gaming Adventure</span>
          </h1>
          <p className="text-xl text-secondary-300 mb-8">
            Explore thousands of games, connect with friends, and experience the best gaming platform
            designed for players like you.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/games"
              className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition duration-300 text-center"
            >
              Browse Games
            </Link>
            <Link
              to="/categories"
              className="px-8 py-3 bg-secondary-800 hover:bg-secondary-700 text-white font-medium rounded-lg transition duration-300 text-center"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Stats */}
      <div className="bg-secondary-800 border-t border-secondary-700">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-primary-400">1000+</div>
              <div className="text-secondary-400">Games</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary-400">50K+</div>
              <div className="text-secondary-400">Players</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary-400">24/7</div>
              <div className="text-secondary-400">Support</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary-400">100%</div>
              <div className="text-secondary-400">Secure</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;