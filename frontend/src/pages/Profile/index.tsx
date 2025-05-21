import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Box, Paper, Tabs, Tab } from "@mui/material";
import { useSelector } from "react-redux";
import LimitsDisplay from "../../components/user/LimitsDisplay";
import ApiKeyManager from "../../components/user/ApiKeyManager";
import { RootState } from "../../redux/store";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const user = useSelector((state: RootState) => state.auth.user);
  const [userLimits, setUserLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Здесь будет загрузка данных профиля из API
    // В реальной имплементации нужно добавить вызовы к API
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Здесь будут API вызовы
        // const response = await api.getUserLimits();
        // setUserLimits(response.data);
        
        // Временные данные для примера
        setUserLimits({
          monthlyTokenLimit: 1000000,
          balance: 25.00,
          tierName: "Pro"
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при загрузке данных профиля:", error);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Профиль пользователя
            </Typography>
            
            {user && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">
                  {user.email}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Тир: {userLimits?.tierName || "Загрузка..."}
                </Typography>
              </Box>
            )}

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleChangeTab} aria-label="profile tabs">
                <Tab label="Лимиты и баланс" />
                <Tab label="API ключи" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <LimitsDisplay 
                loading={loading} 
                limits={userLimits} 
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <ApiKeyManager />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage; 