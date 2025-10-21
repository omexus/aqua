import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useManagerAuth } from '../../contexts/ManagerAuthContext';

interface Statement {
  id: string;
  utilityType: string;
  totalAmount: number;
  period: string;
  isAllocated: boolean;
  allocatedAt?: string;
}

interface UnitAllocation {
  id: string;
  unitNumber: string;
  allocatedAmount: number;
  percentage: number;
  isPaid: boolean;
  status: string;
}

interface AllocationMethod {
  value: string;
  label: string;
  description: string;
}

export const StatementAllocation: React.FC = () => {
  const { user } = useManagerAuth();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [allocations, setAllocations] = useState<UnitAllocation[]>([]);
  const [selectedStatement, setSelectedStatement] = useState<string>('');
  const [allocationMethod, setAllocationMethod] = useState<string>('EQUAL');
  const [loading, setLoading] = useState(false);
  const [allocating, setAllocating] = useState(false);

  const allocationMethods: AllocationMethod[] = [
    {
      value: 'EQUAL',
      label: 'Equal Split',
      description: 'Split costs equally among all units'
    },
    {
      value: 'BY_SQUARE_FOOT',
      label: 'By Square Footage',
      description: 'Split costs based on unit square footage'
    },
    {
      value: 'BY_UNITS',
      label: 'By Unit Count',
      description: 'Split costs based on unit count'
    }
  ];

  useEffect(() => {
    if (user?.activeCondo) {
      loadStatements();
    }
  }, [user?.activeCondo]);

  const loadStatements = async () => {
    if (!user?.activeCondo) return;

    setLoading(true);
    try {
      // TODO: Implement actual API call
      // Mock data for now
      setStatements([
        {
          id: '1',
          utilityType: 'WATER',
          totalAmount: 1500.00,
          period: '2024-01',
          isAllocated: false
        },
        {
          id: '2',
          utilityType: 'ELECTRICITY',
          totalAmount: 2200.00,
          period: '2024-01',
          isAllocated: true,
          allocatedAt: '2024-01-15T10:30:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error loading statements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllocations = async (statementId: string) => {
    if (!user?.activeCondo) return;

    setLoading(true);
    try {
      // TODO: Implement actual API call
      // Mock data for now
      setAllocations([
        {
          id: '1',
          unitNumber: '101',
          allocatedAmount: 150.00,
          percentage: 10.0,
          isPaid: false,
          status: 'PENDING'
        },
        {
          id: '2',
          unitNumber: '102',
          allocatedAmount: 150.00,
          percentage: 10.0,
          isPaid: true,
          status: 'PAID'
        }
      ]);
    } catch (error) {
      console.error('Error loading allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async () => {
    if (!selectedStatement || !user?.activeCondo) return;

    setAllocating(true);
    try {
      // TODO: Implement actual API call
      const response = await fetch(`http://localhost:5001/api/statementallocation/${user.activeCondo.id}/statements/${selectedStatement}/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          allocationMethod
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Reload statements and allocations
          await loadStatements();
          await loadAllocations(selectedStatement);
        }
      }
    } catch (error) {
      console.error('Error allocating statement:', error);
    } finally {
      setAllocating(false);
    }
  };

  const selectedStatementData = statements.find(s => s.id === selectedStatement);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Statement Allocation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Allocate shared utility costs among condo units
      </Typography>

      {!user?.activeCondo && (
        <Alert severity="warning">
          Please select a condo to manage statements.
        </Alert>
      )}

      {user?.activeCondo && (
        <>
          {/* Statement Selection */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Statement to Allocate
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Statement</InputLabel>
                    <Select
                      value={selectedStatement}
                      onChange={(e) => {
                        setSelectedStatement(e.target.value);
                        if (e.target.value) {
                          loadAllocations(e.target.value);
                        }
                      }}
                      label="Statement"
                    >
                      {statements.map((statement) => (
                        <MenuItem key={statement.id} value={statement.id}>
                          <Box>
                            <Typography variant="body1">
                              {statement.utilityType} - ${statement.totalAmount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {statement.period} {statement.isAllocated && '(Allocated)'}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Allocation Method</InputLabel>
                    <Select
                      value={allocationMethod}
                      onChange={(e) => setAllocationMethod(e.target.value)}
                      label="Allocation Method"
                    >
                      {allocationMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          <Box>
                            <Typography variant="body1">
                              {method.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {method.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {selectedStatementData && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount: ${selectedStatementData.totalAmount}
                  </Typography>
                  {selectedStatementData.isAllocated && (
                    <Chip
                      label="Already Allocated"
                      color="success"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              )}

              {selectedStatement && !selectedStatementData?.isAllocated && (
                <Button
                  variant="contained"
                  onClick={handleAllocate}
                  disabled={allocating}
                  startIcon={<MoneyIcon />}
                  sx={{ mt: 2 }}
                >
                  {allocating ? 'Allocating...' : 'Allocate Statement'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Allocations Table */}
          {selectedStatement && allocations.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Unit Allocations
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Unit</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Payment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allocations.map((allocation) => (
                        <TableRow key={allocation.id}>
                          <TableCell>{allocation.unitNumber}</TableCell>
                          <TableCell align="right">
                            ${allocation.allocatedAmount.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {allocation.percentage.toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={allocation.status}
                              color={allocation.isPaid ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {allocation.isPaid ? 'Paid' : 'Pending'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
