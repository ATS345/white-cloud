import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/categories');
        setCategories(response.data);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-secondary-300">Loading categories...</p>
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
        <h1 className="text-3xl font-bold mb-8">Game Categories</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className="bg-secondary-800 hover:bg-secondary-700 rounded-xl p-6 transition duration-300 flex items-center justify-center text-center"
            >
              <h2 className="text-xl font-bold">{category.name}</h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;