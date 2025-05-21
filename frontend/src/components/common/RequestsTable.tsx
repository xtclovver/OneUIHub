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
import ru from 'date-fns/locale/ru';
import { Request } from '../../redux/slices/requestsSlice';

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
          <Typography variant="body2" fontWeight="bold">
            Итого: {formatCost(totalCost)}
          </Typography>
        </Box>
      );
    }
    return <Typography>{formatCost(totalCost)}</Typography>;
  };

  return (
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
  );
};

export default RequestsTable; 