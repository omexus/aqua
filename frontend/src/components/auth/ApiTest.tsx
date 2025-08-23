import React, { useState } from 'react';
import { Button, Text, Paper, Stack, Alert } from '@mantine/core';
import axios from 'axios';

export const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testApiConnection = async () => {
    try {
      setResult('Testing API connection...');
      setError('');
      
      const response = await axios.post(
        'http://localhost:5001/api/mock/auth/mock-login',
        {
          email: 'john.doe@aqua.com',
          password: 'test123'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('API test error:', err);
      if (axios.isAxiosError(err)) {
        setError(`Error: ${err.response?.status} ${err.response?.statusText} - ${JSON.stringify(err.response?.data)}`);
      } else {
        setError(`Error: ${err}`);
      }
    }
  };

  return (
    <Paper p="md" withBorder style={{ maxWidth: 600, margin: '0 auto' }}>
      <Stack gap="md">
        <Text size="xl" fw={700} ta="center">
          🔧 API Connection Test
        </Text>
        
        <Button onClick={testApiConnection} fullWidth>
          Test API Connection
        </Button>

        {error && (
          <Alert color="red" variant="light">
            <Text size="sm">{error}</Text>
          </Alert>
        )}

        {result && (
          <Alert color="blue" variant="light">
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{result}</Text>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
