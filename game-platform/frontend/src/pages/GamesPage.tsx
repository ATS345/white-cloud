import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const GamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/games');
        setGames(response.data);
        setLoading(false);
      } catch {
        setError('Failed to fetch games');
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

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
            to="/"
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition duration-300"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Games</h1>
          <p className="text-secondary-400">{games.length} games available</p>
        </div>
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
      </div>
    </div>
  );
};

export default GamesPage;