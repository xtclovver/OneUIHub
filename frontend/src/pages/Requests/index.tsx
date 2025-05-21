import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchRequests } from '../../redux/slices/requestsSlice';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Switch,
  FormControlLabel,
  Box,
  Chip,
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';

const RequestsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading, error } = useSelector((state: RootState) => state.requests);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleToggleCostBreakdown = () => {
    setShowCostBreakdown(!showCostBreakdown);
  };

  // Функция для форматирования стоимости
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(6)}`;
  };

  // Компонент для отображения стоимости с декомпозицией или без
  const CostDisplay = ({ inputCost, outputCost, totalCost }: { inputCost: number, outputCost: number, totalCost: number }) => {
    if (showCostBreakdown) {
      return (
        <Box>
          <Typography variant="body2" color="text.secondary">
            Ввод: {formatCost(inputCost)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Вывод: {formatCost(outputCost)}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            Итого: {formatCost(totalCost)}
          </Typography>
        </Box>
      );
    }
    return <Typography>{formatCost(totalCost)}</Typography>;
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        background: 'linear-gradient(45deg, #6352b1 0%, #4568DC 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold',
        mb: 3
      }}>
        История запросов
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControlLabel
          control={
            <Switch
              checked={showCostBreakdown}
              onChange={handleToggleCostBreakdown}
              color="primary"
            />
          }
          label="Показать разбивку стоимости"
        />
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography fontWeight="bold">Дата</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Модель</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Входных токенов</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Выходных токенов</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Стоимость</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length > 0 ? (
                requests
                  .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                  .map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        {format(new Date(request.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.model.name} 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(45deg, #6352b1 0%, #4568DC 100%)',
                            color: 'white'
                          }} 
                        />
                      </TableCell>
                      <TableCell>{request.input_tokens.toLocaleString()}</TableCell>
                      <TableCell>{request.output_tokens.toLocaleString()}</TableCell>
                      <TableCell>
                        <CostDisplay 
                          inputCost={request.input_cost} 
                          outputCost={request.output_cost} 
                          totalCost={request.total_cost} 
                        />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1">
                      История запросов пуста
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {requests.length > rowsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(requests.length / rowsPerPage)}
              page={page}
              onChange={handleChangePage}
              color="primary"
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default RequestsPage; 