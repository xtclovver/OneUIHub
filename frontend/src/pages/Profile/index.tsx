import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LimitsDisplay from "../../components/user/LimitsDisplay";
import ApiKeyManager from "../../components/user/ApiKeyManager";
import { RootState } from "../../redux/store";

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
        setTimeout(() => {
          setUserLimits({
            monthlyTokenLimit: 1000000,
            balance: 25.00,
            tierName: "Pro"
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Ошибка при загрузке данных профиля:", error);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="py-10 rounded-xl glass-card">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Профиль пользователя</h1>
          {user && (
            <div>
              <p className="text-xl text-white mb-1">{user.email}</p>
              <p className="text-gray-300">
                Тариф: <span className="text-primary-400">{userLimits?.tierName || "Загрузка..."}</span>
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <div className="flex -mb-px">
              <button
                className={`py-2 px-4 text-center ${
                  tabValue === 0
                    ? "border-b-2 border-primary-500 text-primary-500"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setTabValue(0)}
              >
                Лимиты и баланс
              </button>
              <button
                className={`py-2 px-4 text-center ${
                  tabValue === 1
                    ? "border-b-2 border-primary-500 text-primary-500"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setTabValue(1)}
              >
                API ключи
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          {tabValue === 0 && (
            <LimitsDisplay 
              loading={loading} 
              limits={userLimits} 
            />
          )}
          
          {tabValue === 1 && (
            <ApiKeyManager />
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage; 