import { Link } from 'react-router-dom';
import { FiAlertCircle, FiHome } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FiAlertCircle className="text-gray-400 mb-6" size={64} />
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-full font-medium inline-flex items-center"
      >
        <FiHome className="mr-2" />
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
