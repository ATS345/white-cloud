import React, { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import axios from 'axios';

interface Review {
  id: number;
  user_id: number;
  game_id: number;
  rating: number;
  content: string;
  user: {
    id: number;
    username: string;
    avatar: string;
  };
  created_at: string;
  updated_at: string;
}

interface ReviewListProps {
  gameId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ gameId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/games/${gameId}/reviews`);
        setReviews(response.data);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch reviews');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary-400">No reviews yet. Be the first to review this game!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="bg-secondary-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{review.user.username.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h4 className="font-medium">{review.user.username}</h4>
                <p className="text-sm text-secondary-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <FiStar
                  key={index}
                  className={`w-4 h-4 ${index < review.rating ? 'text-yellow-400' : 'text-secondary-600'}`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">{review.rating}</span>
            </div>
          </div>
          <p className="text-secondary-300">{review.content}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;