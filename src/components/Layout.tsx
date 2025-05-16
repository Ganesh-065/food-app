import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { useGetCartQuery } from '../api/cartApiSlice';
import Header from './Header';
import Footer from './Footer';
import Notification from './Notification';

// Layout component to wrap all pages
const Layout = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Fetch cart data when authenticated
  const { refetch } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Re-fetch cart when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>

      <Footer />

      {/* Notification component for showing alerts, errors, etc. */}
      <Notification />
    </div>
  );
};

export default Layout;
