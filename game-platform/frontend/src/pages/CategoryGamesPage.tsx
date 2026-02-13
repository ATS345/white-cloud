import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import axios from 'axios';

interface Game {
  id: number;
  title: string;
  price: number;
  rating: number;
  cover_image: string;
  developer: string;
}

const CategoryGamesPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const fetchCategoryGames = async () => {
      if (!slug) {
        setError('Category slug is required');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/api/games/category/${slug}`);
        setGames(response.data);
        // Extract category name from slug (capitalize each word)
        const name = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setCategoryName(name);
        setLoading(false);
      } catch {
        setError('Failed to fetch category games');
        setLoading(false);
      }
    };

    fetchCategoryGames();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-secondary-300">Loading games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            to="/categories"
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition duration-300"
          >
            Go Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/categories"
            className="flex items-center text-secondary-300 hover:text-white transition duration-300"
          >
            <FiArrowLeft className="mr-2" />
            Back to Categories
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{categoryName} Games</h1>
          <p className="text-secondary-400">{games.length} games available</p>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12 bg-secondary-800 rounded-xl">
            <p className="text-secondary-400 mb-4">No games found in this category</p>
            <Link
              to="/games"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition duration-300"
            >
              Browse All Games
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map(game => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                price={game.price}
                rating={game.rating}
                coverImage={game.cover_image}
                developer={game.developer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryGamesPage;