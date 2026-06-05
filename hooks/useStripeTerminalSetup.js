// This hook manages the setup and connection of Stripe Terminal readers. 
// It initializes the Stripe Terminal SDK, discovers available readers, and handles connection and payment status updates. 
// It also provides functions to initialize the reader, discover and connect to readers.

import { useState } from 'react';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import Logger from '../components/Logger';

export default function useStripeTerminalSetup(settings) {
  const [initialized, setInitialized] = useState(false);
  const [reader, setReader] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');

  const { Log } = Logger('StripeTerminalSetup');

  // Check out /node_modules/@stripe/stripe-terminal-react-native/lib/typescript/src/types/index.d.ts for all the possible UserCallbacks
  const { initialize, discoverReaders, connectReader, disconnectReader } = useStripeTerminal({
    onUpdateDiscoveredReaders: (readers) => {
      Log('onUpdateDiscoveredReaders', readers);
      if (readers.length > 0) {
        // @ts-ignore
        setReader(readers[0]);
        settings.isAOD
          ? connectAODReader(readers[0])
          : connectTTPReader(readers[0]);
      }
      else {
        Log("No reader found");
      }
    },
    onDidChangePaymentStatus: (status) => {
      Log('onDidChangePaymentStatus', status);
      setPaymentStatus(status);
      // Possible values: 'notReady', 'ready', 'processing', 'waitingForInput'
    },
  });

  const initializeReader = async () => {
    Log("Starting reader software");
    const { error, reader } = await initialize();
    if (reader) {
      Log('initializeReader - found reader: ', reader);
    }
    if (error) {
      Log('StripeTerminal init failed', error);
      return;
    }
    setInitialized(true);
  };

  const connectAODReader = async (reader) => {
    const { error } = await connectReader({
      reader: reader,
      discoveryMethod: 'appsOnDevices',
    });
    if (error) {
      Log("connectHandoffReader", error);
      return;
    }
  };

  const connectTTPReader = async (reader) => {
    const { error } = await connectReader({
      reader: reader,
      locationId: settings.ttpLocation,
      discoveryMethod: 'tapToPay',
    });
    if (error) {
      Log("connectLocalMobileReader", error);
      return;
    }
  };

  const discoverReaderAndConnect = async () => {
    try {
      await disconnectReader();
    } catch (error) {
      Log("Error disconnecting reader: ", error);
    }

    const { error } = await discoverReaders({
      discoveryMethod: settings.isAOD ? 'appsOnDevices' : 'tapToPay',
      // simulated: !settings.isAOD
    });
    if (error) {
      Log("discoverReaders", error);
    }
  };

  return {
    initialized,
    reader,
    paymentStatus,
    initializeReader,
    discoverReaderAndConnect
  };
}