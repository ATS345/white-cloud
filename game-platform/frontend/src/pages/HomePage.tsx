import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import GameCard from '../components/GameCard';

const HomePage: React.FC = () => {
  // Mock data for featured games
  const featuredGames = [
    {
      id: 1,
      title: 'Cyberpunk 2077',
      price: 29.99,
      rating: 4.5,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%202077%20game%20cover%20dark%20futuristic%20city&image_size=square',
      developer: 'CD Projekt Red'
    },
    {
      id: 2,
      title: 'The Witcher 3',
      price: 19.99,
      rating: 4.8,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=the%20witcher%203%20game%20cover%20fantasy%20medieval%20warrior&image_size=square',
      developer: 'CD Projekt Red'
    },
    {
      id: 3,
      title: 'Red Dead Redemption 2',
      price: 39.99,
      rating: 4.7,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20dead%20redemption%202%20game%20cover%20wild%20west%20cowboy&image_size=square',
      developer: 'Rockstar Games'
    },
    {
      id: 4,
      title: 'Grand Theft Auto V',
      price: 29.99,
      rating: 4.6,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=grand%20theft%20auto%20v%20game%20cover%20modern%20city%20crime&image_size=square',
      developer: 'Rockstar Games'
    }
  ];

  // Mock data for new releases
  const newReleases = [
    {
      id: 5,
      title: 'Elden Ring',
      price: 59.99,
      rating: 4.9,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elden%20ring%20game%20cover%20fantasy%20dark%20souls&image_size=square',
      developer: 'FromSoftware'
    },
    {
      id: 6,
      title: 'God of War Ragnarök',
      price: 59.99,
      rating: 4.8,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=god%20of%20war%20ragnarok%20game%20cover%20norse%20mythology&image_size=square',
      developer: 'Santa Monica Studio'
    },
    {
      id: 7,
      title: 'Horizon Forbidden West',
      price: 49.99,
      rating: 4.6,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=horizon%20forbidden%20west%20game%20cover%20post%20apocalyptic%20robot%20dinosaurs&image_size=square',
      developer: 'Guerrilla Games'
    },
    {
      id: 8,
      title: 'Starfield',
      price: 69.99,
      rating: 4.3,
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=starfield%20game%20cover%20space%20exploration%20sci-fi&image_size=square',
      developer: 'Bethesda Game Studios'
    }
  ];

  return (
    <div className="min-h-screen bg-secondary-900 text-white">
      <Navbar />
      <Hero />

      {/* Featured Games Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Games</h2>
            <a href="/games" className="text-primary-400 hover:text-primary-300 font-medium">
              View All
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.map(game => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                price={game.price}
                rating={game.rating}
                coverImage={game.coverImage}
                developer={game.developer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* New Releases Section */}
      <section className="py-16 bg-secondary-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">New Releases</h2>
            <a href="/games" className="text-primary-400 hover:text-primary-300 font-medium">
              View All
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newReleases.map(game => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                price={game.price}
                rating={game.rating}
                coverImage={game.coverImage}
                developer={game.developer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 border-t border-secondary-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">GamePlatform</h3>
              <p className="text-secondary-400">
                Your ultimate destination for gaming. Discover, play, and connect with gamers worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="/" className="hover:text-primary-400">Home</a></li>
                <li><a href="/games" className="hover:text-primary-400">Games</a></li>
                <li><a href="/categories" className="hover:text-primary-400">Categories</a></li>
                <li><a href="/about" className="hover:text-primary-400">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="/support" className="hover:text-primary-400">Help Center</a></li>
                <li><a href="/faq" className="hover:text-primary-400">FAQ</a></li>
                <li><a href="/contact" className="hover:text-primary-400">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-primary-400">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="/social" className="hover:text-primary-400">Community</a></li>
                <li><a href="/forums" className="hover:text-primary-400">Forums</a></li>
                <li><a href="/discord" className="hover:text-primary-400">Discord</a></li>
                <li><a href="/twitter" className="hover:text-primary-400">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-800 mt-12 pt-8 text-center text-secondary-500">
            <p>&copy; {new Date().getFullYear()} GamePlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;