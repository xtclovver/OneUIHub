import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  Pagination
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

// Определение интерфейса Request локально
interface Request {
  id: string;
  model: {
    name: string;
  };
  input_tokens: number;
  output_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  created_at: string;
}

interface RequestsTableProps {
  requests: Request[];
  showCostBreakdown: boolean;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ requests, showCostBreakdown }) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
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
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            Итого: {formatCost(totalCost)}
          </Typography>
        </Box>
      );
    }
    return <Typography sx={{ color: "#59716F" }}>{formatCost(totalCost)}</Typography>;
  };

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(233, 127, 94, 0.05)' }}>
              <TableCell><Typography fontWeight="bold" color="text.primary">Дата</Typography></TableCell>
              <TableCell><Typography fontWeight="bold" color="text.primary">Модель</Typography></TableCell>
              <TableCell><Typography fontWeight="bold" color="text.primary">Входных токенов</Typography></TableCell>
              <TableCell><Typography fontWeight="bold" color="text.primary">Выходных токенов</Typography></TableCell>
              <TableCell><Typography fontWeight="bold" color="text.primary">Стоимость</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length > 0 ? (
              requests
                .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                .map((request) => (
                  <TableRow key={request.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(233, 127, 94, 0.04)' } }}>
                    <TableCell>
                      {format(new Date(request.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.model.name} 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(45deg, #E97F5E 0%, #D46647 100%)',
                          color: 'white',
                          fontWeight: 500
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
                  <Box 
                    sx={{ 
                      py: 6, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      color: 'text.secondary' 
                    }}
                  >
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 40C15.18 40 8 32.82 8 24C8 15.18 15.18 8 24 8C32.82 8 40 15.18 40 24C40 32.82 32.82 40 24 40Z" fill="#E97F5E" fillOpacity="0.4"/>
                      <path d="M24 28C26.2091 28 28 26.2091 28 24C28 21.7909 26.2091 20 24 20C21.7909 20 20 21.7909 20 24C20 26.2091 21.7909 28 24 28Z" fill="#E97F5E" fillOpacity="0.4"/>
                    </svg>
                    <Typography variant="body1" mt={2}>
                      История запросов пуста
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {requests.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(requests.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            sx={{ 
              '& .MuiPaginationItem-root': { color: '#59716F' },
              '& .Mui-selected': { 
                backgroundColor: 'rgba(233, 127, 94, 0.1) !important',
                color: '#E97F5E'
              }
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default RequestsTable; 