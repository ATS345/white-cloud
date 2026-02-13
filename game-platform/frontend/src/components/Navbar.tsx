import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiUser, FiShoppingCart, FiBell, FiLogOut } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Redirect to home page
    navigate('/');
  };

  return (
    <header className="bg-secondary-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">GP</span>
            </div>
            <span className="text-xl font-bold">GamePlatform</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-primary-400 font-medium' : 'hover:text-primary-400'}>
              Home
            </NavLink>
            <NavLink to="/games" className={({ isActive }) => isActive ? 'text-primary-400 font-medium' : 'hover:text-primary-400'}>
              Games
            </NavLink>
            <NavLink to="/categories" className={({ isActive }) => isActive ? 'text-primary-400 font-medium' : 'hover:text-primary-400'}>
              Categories
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'text-primary-400 font-medium' : 'hover:text-primary-400'}>
              About
            </NavLink>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search games..."
                className="w-full px-4 py-2 rounded-full bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400">
                <FiSearch />
              </button>
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-secondary-300 hover:text-white">
              <FiBell className="w-5 h-5" />
            </button>
            <NavLink to="/cart" className="text-secondary-300 hover:text-white">
              <FiShoppingCart className="w-5 h-5" />
            </NavLink>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="relative">
                  <button className="flex items-center space-x-2 text-secondary-300 hover:text-white">
                    <span>{user.username}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-secondary-800 rounded-lg shadow-lg py-2 z-50">
                    <NavLink to="/profile" className="block px-4 py-2 text-sm text-secondary-300 hover:bg-secondary-700 hover:text-white">
                      Profile
                    </NavLink>
                    <NavLink to="/settings" className="block px-4 py-2 text-sm text-secondary-300 hover:bg-secondary-700 hover:text-white">
                      Settings
                    </NavLink>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-secondary-700"
                    >
                      <div className="flex items-center space-x-2">
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink to="/auth" className="flex items-center space-x-2 text-secondary-300 hover:text-white">
                <FiUser className="w-5 h-5" />
                <span>Sign In</span>
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={toggleMenu}>
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-secondary-800">
            <nav className="flex flex-col space-y-4">
              <NavLink to="/" className="hover:text-primary-400" onClick={toggleMenu}>
                Home
              </NavLink>
              <NavLink to="/games" className="hover:text-primary-400" onClick={toggleMenu}>
                Games
              </NavLink>
              <NavLink to="/categories" className="hover:text-primary-400" onClick={toggleMenu}>
                Categories
              </NavLink>
              <NavLink to="/about" className="hover:text-primary-400" onClick={toggleMenu}>
                About
              </NavLink>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search games..."
                  className="w-full px-4 py-2 rounded-full bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400">
                  <FiSearch />
                </button>
              </div>
              <div className="flex items-center space-x-4 pt-4 border-t border-secondary-800">
                <button className="text-secondary-300 hover:text-white">
                  <FiBell className="w-5 h-5" />
                </button>
                <NavLink to="/cart" className="text-secondary-300 hover:text-white" onClick={toggleMenu}>
                  <FiShoppingCart className="w-5 h-5" />
                </NavLink>
                {user ? (
                  <div className="flex items-center space-x-2 text-secondary-300 hover:text-white">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <span>{user.username}</span>
                  </div>
                ) : (
                  <NavLink to="/auth" className="flex items-center space-x-2 text-secondary-300 hover:text-white">
                    <FiUser className="w-5 h-5" />
                    <span>Sign In</span>
                  </NavLink>
                )}
              </div>
              {user && (
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex items-center space-x-2 text-red-400 hover:text-red-300"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;