import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './redux/store';
import { getProfile } from './redux/slices/authSlice';

// Layouts
import MainLayout from './components/common/MainLayout';
import AuthLayout from './components/common/AuthLayout';

// Pages
import HomePage from './pages/Home';
import CompanyPage from './pages/Company';
import ModelsPage from './pages/Models';
import ModelDetailPage from './pages/Models/ModelDetail';
import ProfilePage from './pages/Profile';
import RequestsPage from './pages/Requests';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import NotFoundPage from './pages/NotFound';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch, token]);

  return (
    <Router>
      <Routes>
        {/* Публичные маршруты */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/companies/:id" element={<CompanyPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/models/:id" element={<ModelDetailPage />} />
        </Route>

        {/* Аутентификация */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/profile" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/profile" />} />
        </Route>

        {/* Защищенные маршруты */}
        <Route element={<MainLayout requireAuth />}>
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/requests" element={isAuthenticated ? <RequestsPage /> : <Navigate to="/login" />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App; 