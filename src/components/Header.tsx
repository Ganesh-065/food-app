import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectTotalItems,
} from '../store/slices/cartSlice';
import {
  selectIsAuthenticated,
  selectCurrentUser,
} from '../store/slices/authSlice';
import {
  setSearchQuery,
  selectSearchQuery,
  selectMobileMenuOpen,
  toggleMobileMenu,
  closeMobileMenu,
} from '../store/slices/uiSlice';
import { useAuth } from '../hooks/useAuth';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { logout } = useAuth();

  // Get state from Redux
  const cartItemCount = useSelector(selectTotalItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const searchQuery = useSelector(selectSearchQuery);
  const mobileMenuOpen = useSelector(selectMobileMenuOpen);

  // Local state for search functionality
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Update local search query when Redux state changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery(localSearchQuery));
    navigate('/');
    dispatch(closeMobileMenu());
  };

  // Handle mobile menu toggle
  const handleMenuToggle = () => {
    dispatch(toggleMobileMenu());
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    dispatch(closeMobileMenu());
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-primary"
            onClick={() => dispatch(closeMobileMenu())}
          >
            FoodDash
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search restaurants..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-64 py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-primary"
              >
                <FiSearch size={18} />
              </button>
            </form>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-gray-100"
              >
                <FiShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100">
                    <FiUser size={20} />
                    <span className="text-sm font-medium">{user?.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Link
              to="/cart"
              className="relative p-2 mr-2 rounded-full hover:bg-gray-100"
            >
              <FiShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={handleMenuToggle}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <form
              onSubmit={handleSearchSubmit}
              className="mb-4"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-primary"
                >
                  <FiSearch size={18} />
                </button>
              </div>
            </form>

            <nav className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="px-2 py-3 bg-gray-50 rounded-md mb-2">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-2 py-3 text-left text-primary hover:bg-gray-50 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-2 py-3 text-primary hover:bg-gray-50 rounded-md"
                    onClick={() => dispatch(closeMobileMenu())}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-2 py-3 bg-primary text-white rounded-md text-center"
                    onClick={() => dispatch(closeMobileMenu())}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
