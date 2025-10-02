import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import { registerRootComponent } from 'expo';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { RecoilRoot } from 'recoil';

import App from './App';

export default function Root() {
  const backendUrl = process.env.EXPO_PUBLIC_API_URL;
  const account = process.env.EXPO_PUBLIC_ACCOUNT;

  const fetchTokenProvider = async () => {
    try {
      const response = await fetch(backendUrl + '/connection_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: account,
        })
      });
      const { secret } = await response.json();
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
    <RecoilRoot>
      <StripeTerminalProvider logLevel="error" tokenProvider={fetchTokenProvider}>
        <App />
      </StripeTerminalProvider>
    </RecoilRoot>
  );
}

registerRootComponent(Root);