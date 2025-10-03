import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import { useEffect } from 'react';
import { api } from './api';

import App from './App';

export default function Root() {
  const fetchTokenProvider = async () => {
    try {
      const { secret } = await api.getConnectionToken();
      return secret;
    }
    catch (error) {
      console.log('Error with token provider', error);
    }
  };

  useEffect(() => {
    fetchTokenProvider();
  }, []);

  return (
      <StripeTerminalProvider logLevel="error" tokenProvider={fetchTokenProvider}>
        <App />
      </StripeTerminalProvider>
  );
}