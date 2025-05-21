import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/slices/authSlice";
import { Container, Box, Typography, TextField, Button, Paper, Link } from "@mui/material";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    try {
      setLoading(true);
      // В реальном приложении здесь был бы вызов API и диспатч экшена
      /*
      const result = await dispatch(login({ email, password }));
      if (result.meta.requestStatus === "fulfilled") {
        navigate("/profile");
      }
      */

      // Для демонстрации просто переходим на страницу профиля
      setTimeout(() => {
        navigate("/profile");
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError("Ошибка при входе в систему. Проверьте ваши учетные данные.");
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Paper
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Вход в систему
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: "46px" }}
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link href="/register" variant="body2">
                Нет аккаунта? Зарегистрируйтесь
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 