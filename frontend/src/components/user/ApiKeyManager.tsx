import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";

interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  expiresAt: string | null;
}

const ApiKeyManager: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [expireDays, setExpireDays] = useState(30);
  const [newKeyData, setNewKeyData] = useState<{ key: string } | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    // Загрузка API ключей пользователя
    // В реальной имплементации нужно вызвать API
    const fetchKeys = async () => {
      try {
        setLoading(true);
        // const response = await api.getApiKeys();
        // setKeys(response.data);
        
        // Временные данные для примера
        setKeys([
          {
            id: '1',
            name: 'Ключ разработки',
            createdAt: '2023-08-15T10:00:00Z',
            expiresAt: '2023-11-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Ключ продакшн',
            createdAt: '2023-09-01T14:30:00Z',
            expiresAt: null
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке API ключей:', error);
        setLoading(false);
      }
    };

    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    try {
      setIsCreating(true);
      
      // В реальной имплементации нужно вызвать API
      // const response = await api.createApiKey({
      //   name: newKeyName,
      //   expireDays: expireDays
      // });
      
      // Эмуляция ответа от сервера
      setTimeout(() => {
        setNewKeyData({
          key: 'oneai-sk-' + Math.random().toString(36).substring(2, 15)
        });
        
        // Добавление нового ключа в список
        const newKey = {
          id: Date.now().toString(),
          name: newKeyName,
          createdAt: new Date().toISOString(),
          expiresAt: expireDays ? new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000).toISOString() : null
        };
        
        setKeys([...keys, newKey]);
        setNewKeyName('');
        setIsCreating(false);
        setSnackbarMessage("API ключ успешно создан");
        setShowSnackbar(true);
      }, 1000);
      
    } catch (error) {
      console.error('Ошибка при создании API ключа:', error);
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      // В реальной имплементации нужно вызвать API
      // await api.deleteApiKey(id);
      
      // Удаление ключа из списка
      setKeys(keys.filter(key => key.id !== id));
      setSnackbarMessage("API ключ успешно удален");
      setShowSnackbar(true);
    } catch (error) {
      console.error('Ошибка при удалении API ключа:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Управление API ключами
      </Typography>
      
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          API ключи используются для авторизации запросов к OneUI API. Храните их в безопасности.
        </Typography>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Список существующих ключей */}
            {keys.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left">Название</th>
                      <th className="px-4 py-3 text-left">Создан</th>
                      <th className="px-4 py-3 text-left">Истекает</th>
                      <th className="px-4 py-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map(key => (
                      <tr key={key.id} className="border-b border-gray-700">
                        <td className="px-4 py-3 text-gray-300">{key.name}</td>
                        <td className="px-4 py-3 text-gray-300">{formatDate(key.createdAt)}</td>
                        <td className="px-4 py-3 text-gray-300">
                          {key.expiresAt ? formatDate(key.expiresAt) : 'Никогда'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => {
                              setSelectedKeyId(key.id);
                              setOpenDialog(true);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-4">
                У вас пока нет API ключей
              </div>
            )}
            
            {/* Форма создания нового ключа */}
            <div className="mt-8 p-4 border border-gray-700 rounded-lg">
              <h4 className="text-lg font-medium mb-4">Создать новый API ключ</h4>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="keyName" className="block text-sm font-medium text-gray-300 mb-1">
                    Название ключа
                  </label>
                  <input
                    id="keyName"
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Например: Ключ для разработки"
                  />
                </div>
                
                <div>
                  <label htmlFor="expireDays" className="block text-sm font-medium text-gray-300 mb-1">
                    Срок действия (дней)
                  </label>
                  <select
                    id="expireDays"
                    value={expireDays}
                    onChange={(e) => setExpireDays(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={7}>7 дней</option>
                    <option value={30}>30 дней</option>
                    <option value={90}>90 дней</option>
                    <option value={365}>1 год</option>
                    <option value={0}>Бессрочно</option>
                  </select>
                </div>
                
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName || isCreating}
                  className="btn gradient-primary w-full py-2"
                >
                  {isCreating ? 'Создание...' : 'Создать API ключ'}
                </button>
              </div>
            </div>
            
            {/* Отображение нового ключа */}
            {newKeyData && (
              <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <h4 className="text-lg font-medium mb-2 text-green-400">API ключ создан</h4>
                <p className="text-gray-300 text-sm mb-2">
                  Скопируйте ваш ключ. Он будет показан только один раз!
                </p>
                <div className="bg-gray-800 p-3 rounded-md font-mono text-sm text-gray-300 mb-3 overflow-x-auto">
                  {newKeyData.key}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKeyData.key);
                    alert('Ключ скопирован в буфер обмена!');
                  }}
                  className="btn-secondary btn"
                >
                  Копировать
                </button>
                <button
                  onClick={() => setNewKeyData(null)}
                  className="btn bg-gray-700 text-white ml-2"
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        )}
      </Box>
      
      {/* Диалог подтверждения удаления */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Удаление API ключа</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить этот API ключ? Это действие нельзя отменить, и все приложения, 
            использующие этот ключ, перестанут работать.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={() => handleDeleteKey(selectedKeyId || '')} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомление */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApiKeyManager; 