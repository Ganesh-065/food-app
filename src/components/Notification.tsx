import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectNotification,
  hideNotification,
  clearNotification,
} from '../store/slices/uiSlice';
import { FiInfo, FiCheckCircle, FiAlertTriangle, FiX, FiAlertCircle } from 'react-icons/fi';

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.visible) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());

        // Clear notification completely after animation
        setTimeout(() => {
          dispatch(clearNotification());
        }, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.visible, dispatch]);

  // Handle close notification
  const handleClose = () => {
    dispatch(hideNotification());

    // Clear notification completely after animation
    setTimeout(() => {
      dispatch(clearNotification());
    }, 300);
  };

  // If no notification or not visible, don't render anything
  if (!notification.type || !notification.message || !notification.visible) {
    return null;
  }

  // Get notification icon and styles based on type
  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'info':
        return {
          icon: <FiInfo size={20} />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-500',
          iconColor: 'text-blue-500',
        };
      case 'success':
        return {
          icon: <FiCheckCircle size={20} />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-500',
          iconColor: 'text-green-500',
        };
      case 'warning':
        return {
          icon: <FiAlertTriangle size={20} />,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-500',
          iconColor: 'text-yellow-500',
        };
      case 'error':
        return {
          icon: <FiAlertCircle size={20} />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-500',
          iconColor: 'text-red-500',
        };
      default:
        return {
          icon: <FiInfo size={20} />,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-500',
          iconColor: 'text-gray-500',
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border-l-4 ${styles.bgColor} ${styles.borderColor} transform transition-transform duration-300 ${notification.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`mr-3 ${styles.iconColor} flex-shrink-0 mt-0.5`}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <p className={`${styles.textColor} font-medium`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 -mr-1 -mt-1 text-gray-400 hover:text-gray-900 focus:outline-none"
          aria-label="Close notification"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
