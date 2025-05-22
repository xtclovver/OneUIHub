import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

// Макет для страниц аутентификации (логин, регистрация)
const AuthLayout: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Декоративные элементы фона */}
      <Box
        sx={{
          position: 'absolute',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(120, 85, 245, 0.1) 0%, rgba(70, 140, 220, 0.1) 100%)',
          filter: 'blur(80px)',
          top: '-10%',
          right: '-10%',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(245, 85, 85, 0.1) 0%, rgba(220, 140, 70, 0.1) 100%)',
          filter: 'blur(80px)',
          bottom: '-10%',
          left: '-10%',
          zIndex: 0
        }}
      />

      {/* Логотип и заголовок */}
      <Box
        sx={{
          position: 'relative',
          py: 6,
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <Typography
          variant="h4"
          component={Link}
          to="/"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          OneAI Hub
        </Typography>
      </Box>

      {/* Основной контент */}
      <Container maxWidth="sm" sx={{ mb: 8, position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Outlet />
        </Paper>
      </Container>

      {/* Подвал */}
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          mt: 'auto',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} OneAI Hub. Все права защищены.
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout; 