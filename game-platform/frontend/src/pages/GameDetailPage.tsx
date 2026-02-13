import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiDownload, FiShoppingCart, FiShare2, FiCheck } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import axios from 'axios';

interface GameDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  release_date: string;
  developer: string;
  publisher: string;
  cover_image: string;
  trailer_url: string;
  system_requirements: {
    minimum: string;
    recommended: string;
  };
  average_rating: number;
  review_count: number;
  download_count: number;
  categories: number[];
}

const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const addToCart = () => {
    if (!game) return;
    
    // Get current cart from localStorage
    const storedCart = localStorage.getItem('cart');
    const cartItems = storedCart ? JSON.parse(storedCart) : [];

    // Check if game already in cart
    const existingItem = cartItems.find((item: any) => item.game_id === game.id);
    let updatedCart;

    if (existingItem) {
      // Update quantity if game already in cart
      updatedCart = cartItems.map((item: any) => 
        item.game_id === game.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // Add new game to cart
      const newItem = {
        id: Date.now(),
        game_id: game.id,
        title: game.title,
        price: game.price,
        quantity: 1,
        cover_image: game.cover_image
      };
      updatedCart = [...cartItems, newItem];
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Show success state
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  useEffect(() => {
    const fetchGameDetail = async () => {
      if (!id) {
        setError('Game ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/api/games/${id}`);
        setGame(response.data);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch game details');
        setLoading(false);
      }
    };

    fetchGameDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-secondary-300">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-secondary-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Game not found'}</p>
          <Link
            to="/games"
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition duration-300"
          >
            Go Back to Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/games"
            className="flex items-center text-secondary-300 hover:text-white transition duration-300"
          >
            <FiArrowLeft className="mr-2" />
            Back to Games
          </Link>
        </div>

        {/* Game Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img
                src={game.cover_image}
                alt={game.title}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Game Info */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{game.title}</h1>
              <div className="flex items-center bg-secondary-800 px-3 py-1 rounded-full">
                <FiStar className="text-yellow-400 mr-2" />
                <span className="font-medium">{game.average_rating}</span>
                <span className="text-secondary-400 ml-2">({game.review_count} reviews)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <span className="text-secondary-300">Developer: <span className="text-white">{game.developer}</span></span>
              <span className="text-secondary-300">Publisher: <span className="text-white">{game.publisher}</span></span>
              <span className="text-secondary-300">Release Date: <span className="text-white">{new Date(game.release_date).toLocaleDateString()}</span></span>
            </div>

            <p className="text-secondary-300 mb-8 line-clamp-4">{game.description}</p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="text-2xl font-bold">${game.price.toFixed(2)}</div>
              <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition duration-300 flex items-center">
                <FiShoppingCart className="mr-2" />
                Add to Cart
              </button>
              <button className="px-6 py-3 bg-secondary-800 hover:bg-secondary-700 rounded-lg transition duration-300 flex items-center">
                <FiDownload className="mr-2" />
                Download
              </button>
              <button className="p-3 bg-secondary-800 hover:bg-secondary-700 rounded-lg transition duration-300">
                <FiShare2 />
              </button>
            </div>
          </div>
        </div>

        {/* Game Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">About the Game</h2>
            <div className="bg-secondary-800 rounded-xl p-6">
              <p className="text-secondary-300">{game.description}</p>
            </div>

            {/* Trailer */}
            {game.trailer_url && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Trailer</h2>
                <div className="bg-secondary-800 rounded-xl p-6">
                  <div className="aspect-video bg-secondary-900 rounded-lg flex items-center justify-center">
                    <a
                      href={game.trailer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 font-medium"
                    >
                      Watch Trailer on YouTube
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* System Requirements */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">System Requirements</h2>
            <div className="bg-secondary-800 rounded-xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Minimum</h3>
                <p className="text-secondary-300 text-sm">{game.system_requirements.minimum}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Recommended</h3>
                <p className="text-secondary-300 text-sm">{game.system_requirements.recommended}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 bg-secondary-800 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">Game Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-secondary-400">Downloads</span>
                    <span className="text-white">{game.download_count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-secondary-700 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-secondary-400">Positive Reviews</span>
                    <span className="text-white">92%</span>
                  </div>
                  <div className="w-full bg-secondary-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;