import { FC, ReactNode } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  requireAuth?: boolean;
}

const MainLayout: FC<MainLayoutProps> = ({ requireAuth = false }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Header />
      <main className="flex-grow relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
        
        {/* Декоративные элементы Anthropic */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -right-64 -bottom-32 opacity-[0.03] transform rotate-12">
            <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M597 3C597 330 330 597 3 597" stroke="#E97F5E" strokeWidth="12" />
              <circle cx="3" cy="597" r="3" fill="#E97F5E" />
            </svg>
          </div>
          <div className="absolute -left-64 -top-32 opacity-[0.03] transform -rotate-12">
            <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 597C3 270 270 3 597 3" stroke="#E97F5E" strokeWidth="12" />
              <circle cx="597" cy="3" r="3" fill="#E97F5E" />
            </svg>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 