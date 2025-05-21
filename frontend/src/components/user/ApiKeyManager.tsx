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
  key: string;
  createdAt: string;
  lastUsed?: string;
}

const ApiKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    // Загрузка API ключей с сервера
    // В реальной имплементации нужно добавить API вызов
    const fetchApiKeys = async () => {
      setLoading(true);
      // Имитация загрузки данных
      setTimeout(() => {
        // Пример данных
        setApiKeys([
          {
            id: "1",
            name: "Production API Key",
            key: "sk_prod_••••••••••••••••",
            createdAt: "2023-06-15",
            lastUsed: "2023-09-20"
          },
          {
            id: "2",
            name: "Development API Key",
            key: "sk_dev_••••••••••••••••",
            createdAt: "2023-08-01",
            lastUsed: "2023-09-19"
          }
        ]);
        setLoading(false);
      }, 800);
    };

    fetchApiKeys();
  }, []);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    setLoading(true);
    // Имитация создания ключа
    setTimeout(() => {
      const newKey = {
        id: Math.random().toString(36).substring(7),
        name: newKeyName,
        key: `sk_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 10)}`,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setApiKeys([...apiKeys, newKey]);
      setNewKeyName("");
      setNewKeyGenerated(newKey.key);
      setLoading(false);
      setSnackbarMessage("API ключ успешно создан");
      setShowSnackbar(true);
    }, 1000);
  };

  const handleDeleteKey = (id: string) => {
    setSelectedKeyId(id);
    setOpenDialog(true);
  };

  const confirmDelete = () => {
    if (selectedKeyId) {
      setApiKeys(apiKeys.filter(key => key.id !== selectedKeyId));
      setSnackbarMessage("API ключ успешно удален");
      setShowSnackbar(true);
    }
    setOpenDialog(false);
    setSelectedKeyId(null);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
      .then(() => {
        setSnackbarMessage("API ключ скопирован в буфер обмена");
        setShowSnackbar(true);
      })
      .catch(err => {
        console.error('Не удалось скопировать ключ: ', err);
      });
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
        
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 3 }}>
          <TextField
            label="Название ключа"
            variant="outlined"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleCreateKey}
            disabled={!newKeyName.trim() || loading}
            sx={{ height: 56 }}
          >
            {loading ? <CircularProgress size={24} /> : "Создать ключ"}
          </Button>
        </Box>
        
        {newKeyGenerated && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa", border: "1px solid #dee2e6" }}>
            <Typography variant="subtitle2" gutterBottom>
              Ваш новый API ключ (сохраните его, он будет показан только один раз):
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  p: 1,
                  bgcolor: "#e9ecef",
                  borderRadius: 1,
                  flexGrow: 1
                }}
              >
                {newKeyGenerated}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleCopyKey(newKeyGenerated)}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        )}
      </Box>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Ключ</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Последнее использование</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : apiKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  У вас еще нет API ключей
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.name}</TableCell>
                  <TableCell>{key.key}</TableCell>
                  <TableCell>{key.createdAt}</TableCell>
                  <TableCell>{key.lastUsed || "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
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
          <Button onClick={confirmDelete} color="error">
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