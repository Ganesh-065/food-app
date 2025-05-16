import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  clearCredentials,
} from '../store/slices/authSlice';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  LoginRequest,
  RegisterRequest,
} from '../api/authApiSlice';
import { showNotification } from '../store/slices/uiSlice';

// Custom hook to manage authentication
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get auth state from Redux
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // RTK Query mutations
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();

  // Login handler
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        await loginMutation(credentials).unwrap();
        dispatch(
          showNotification({
            type: 'success',
            message: 'Login successful!',
          })
        );
        navigate('/');
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Login failed. Please check your credentials.';

        dispatch(
          showNotification({
            type: 'error',
            message: errorMessage,
          })
        );
        return false;
      }
    },
    [dispatch, loginMutation, navigate]
  );

  // Register handler
  const register = useCallback(
    async (userData: RegisterRequest) => {
      try {
        await registerMutation(userData).unwrap();
        dispatch(
          showNotification({
            type: 'success',
            message: 'Registration successful!',
          })
        );
        navigate('/');
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';

        dispatch(
          showNotification({
            type: 'error',
            message: errorMessage,
          })
        );
        return false;
      }
    },
    [dispatch, registerMutation, navigate]
  );

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(clearCredentials());
      dispatch(
        showNotification({
          type: 'info',
          message: 'You have been logged out.',
        })
      );
      navigate('/login');
      return true;
    } catch (error) {
      // Even if the API call fails, we'll clear credentials from the front-end
      dispatch(clearCredentials());
      navigate('/login');
      return true;
    }
  }, [dispatch, logoutMutation, navigate]);

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    isLoading: isLoginLoading || isRegisterLoading || isLogoutLoading,
  };
};
