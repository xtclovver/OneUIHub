import React from "react";
import { Box, Typography, CircularProgress, Paper, Grid, Divider, Button } from "@mui/material";

interface LimitsDisplayProps {
  loading: boolean;
  limits: {
    monthlyTokenLimit?: number;
    balance?: number;
    tierName?: string;
  } | null;
}

const LimitsDisplay: React.FC<LimitsDisplayProps> = ({ loading, limits }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Информация о лимитах и балансе
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Текущий тариф
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
              {limits?.tierName || "Бесплатный"}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography>
              Ежемесячный лимит токенов: {limits?.monthlyTokenLimit?.toLocaleString() || 0}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button variant="outlined" color="primary">
                Изменить тариф
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Баланс счета
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
              ${limits?.balance?.toFixed(2) || "0.00"}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                Пополнить баланс
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LimitsDisplay; 