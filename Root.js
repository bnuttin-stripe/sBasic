import { useEffect } from 'react';
import { registerRootComponent } from 'expo';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import { api } from './data/api';

// Components
import App from './App';

const Root = () => {
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

export default Root;

registerRootComponent(Root);