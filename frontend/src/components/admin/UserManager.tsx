import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  tier_id: string;
  role: 'customer' | 'enterprise' | 'support' | 'admin';
  created_at: string;
}

interface Tier {
  id: string;
  name: string;
  description: string;
  is_free: boolean;
  price: number;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Стейт для создания/редактирования пользователя
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Необходима авторизация');
          setLoading(false);
          return;
        }
        
        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        // Загружаем список пользователей
        const usersResponse = await axios.get(`${API_URL}/admin/users`, { headers });
        setUsers(usersResponse.data);
        
        // Загружаем список тиров для выпадающего списка
        const tiersResponse = await axios.get(`${API_URL}/tiers`, { headers });
        setTiers(tiersResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Ошибка при загрузке данных');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [API_URL]);
  
  const handleCreateUser = () => {
    setEditingUser({
      email: '',
      tier_id: tiers.length > 0 ? tiers[0].id : '',
      role: 'customer'
    });
    setIsEditing(false);
  };
  
  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsEditing(true);
  };
  
  const handleSaveUser = async () => {
    if (!editingUser || !editingUser.email || !editingUser.tier_id || !editingUser.role) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Необходима авторизация');
        setLoading(false);
        return;
      }
      
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      if (isEditing && editingUser.id) {
        // Обновляем существующего пользователя
        await axios.put(`${API_URL}/admin/users/${editingUser.id}`, editingUser, { headers });
      } else {
        // Создаем нового пользователя
        await axios.post(`${API_URL}/admin/users`, editingUser, { headers });
      }
      
      // Обновляем список пользователей
      const usersResponse = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(usersResponse.data);
      
      // Сбрасываем режим редактирования
      setEditingUser(null);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при сохранении пользователя:', err);
      setError('Ошибка при сохранении пользователя');
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Необходима авторизация');
        setLoading(false);
        return;
      }
      
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      await axios.delete(`${API_URL}/admin/users/${userId}`, { headers });
      
      // Обновляем список пользователей
      const usersResponse = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(usersResponse.data);
      
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при удалении пользователя:', err);
      setError('Ошибка при удалении пользователя');
      setLoading(false);
    }
  };
  
  const handleApproveFreeTier = async (userId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Необходима авторизация');
        setLoading(false);
        return;
      }
      
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      await axios.post(`${API_URL}/admin/approve/${userId}`, {}, { headers });
      
      // Обновляем список пользователей
      const usersResponse = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(usersResponse.data);
      
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при одобрении бесплатного ранга:', err);
      setError('Ошибка при одобрении бесплатного ранга');
      setLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingUser(null);
    setError(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Управление пользователями</h2>
        <button
          onClick={handleCreateUser}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
          disabled={loading}
        >
          Создать пользователя
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {editingUser && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium mb-4">
            {isEditing ? 'Редактирование пользователя' : 'Создание пользователя'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тир *
              </label>
              <select
                value={editingUser.tier_id || ''}
                onChange={(e) => setEditingUser({...editingUser, tier_id: e.target.value})}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} {tier.is_free ? '(бесплатный)' : `($${tier.price})`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Роль *
              </label>
              <select
                value={editingUser.role || 'customer'}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value as User['role']})}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="customer">Клиент</option>
                <option value="enterprise">Корпоративный клиент</option>
                <option value="support">Поддержка</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID пользователя
                </label>
                <input
                  type="text"
                  value={editingUser.id || ''}
                  className="block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
                  disabled
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelEdit}
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              onClick={handleSaveUser}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}
      
      {loading && !editingUser ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тир
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата создания
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const userTier = tiers.find(t => t.id === user.tier_id);
                  
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'customer' && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Клиент</span>}
                        {user.role === 'enterprise' && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Корпоративный</span>}
                        {user.role === 'support' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Поддержка</span>}
                        {user.role === 'admin' && <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Админ</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userTier ? userTier.name : 'Неизвестный тир'}
                        {userTier?.is_free && <span className="ml-1 text-xs text-green-600">(бесплатный)</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Изменить
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Удалить
                          </button>
                          {userTier && !userTier.is_free && (
                            <button
                              onClick={() => handleApproveFreeTier(user.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Одобрить бесплатный
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManager; 