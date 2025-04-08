import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user) {
    // Redirect to login page but save the attempted url
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return children;
};

export default PrivateRoute; 