import React, { useState } from 'react';
import { FiStar, FiSend } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface ReviewFormProps {
  gameId: number;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ gameId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLoggedIn) {
      setError('You must be logged in to submit a review');
      setLoading(false);
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      setLoading(false);
      return;
    }

    if (!content.trim()) {
      setError('Please write a review');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3001/api/games/${gameId}/reviews`,
        { rating, content },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(true);
      setRating(0);
      setContent('');
      setLoading(false);
      
      // Call the callback to refresh reviews
      onReviewSubmitted();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to submit review');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-900/50 border border-green-500 rounded-xl p-6 text-center">
        <FiSend className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-400 mb-2">Review Submitted!</h3>
        <p className="text-green-300">Thank you for your review.</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-secondary-800 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
        <p className="text-secondary-400 mb-6">You must be logged in to submit a review</p>
        <Link
          to="/auth"
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition duration-300 inline-block"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-secondary-800 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6">Leave a Review</h3>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-6">
          <label className="block text-secondary-300 mb-3">Rating</label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="text-2xl focus:outline-none"
              >
                <FiStar
                  className={`w-6 h-6 ${star <= rating ? 'text-yellow-400' : 'text-secondary-600'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Content */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-secondary-300 mb-3">
            Review
          </label>
          <textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            placeholder="Write your review here..."
            rows={4}
            className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition duration-300 font-medium flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              Submit Review
              <FiSend className="ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;