import axios from 'axios';
import { IUserLogin, IUserRegister } from '../types/user';

const API_URL = '/api';

const authApi = {
  // Регистрация пользователя
  register: (userData: IUserRegister) => {
    return axios.post(`${API_URL}/auth/register`, userData);
  },
  
  // Вход пользователя
  login: (userData: IUserLogin) => {
    return axios.post(`${API_URL}/auth/login`, userData);
  },
  
  // Получение данных профиля пользователя
  getProfile: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export default authApi; 