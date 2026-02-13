import React from 'react';
import { Link } from 'react-router-dom';
import Image from './Image';

interface GameCardProps {
  id: number;
  title: string;
  price: number;
  rating: number;
  coverImage: string;
  developer: string;
}

const GameCard: React.FC<GameCardProps> = ({ id, title, price, rating, coverImage, developer }) => {
  return (
    <div className="bg-secondary-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300 group">
      <div className="relative">
        <Image
          src={coverImage}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-3 right-3 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          ${price.toFixed(2)}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
          <div className="flex items-center text-yellow-400">
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
        <p className="text-secondary-400 text-sm mb-4">{developer}</p>
        <Link
          to={`/games/${id}`}
          className="block w-full py-2 bg-primary-500 hover:bg-primary-600 text-white text-center font-medium rounded-lg transition duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default GameCard;