import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Box, CircularProgress } from '@mui/material';

// Компонент для защиты маршрутов, требующих авторизации
const AuthGuard: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const location = useLocation();

  // Если пользователь не аутентифицирован, перенаправляем на страницу логина
  // с сохранением информации о том, откуда пришел пользователь
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если пользователь аутентифицирован, показываем защищенное содержимое
  return <Outlet />;
};

export default AuthGuard; 