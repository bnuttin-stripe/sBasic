import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, Text, View } from 'react-native';
import SimplePayment from './SimplePayment';
import { css } from './styles';

export default function App() {
  const [permissionsValidated, setPermissionsValidated] = useState(false);
  const {
    initialize,
    createPaymentIntent,
    collectPaymentMethod,
    confirmPaymentIntent,
    createSetupIntent,
    collectSetupIntentPaymentMethod,
    confirmSetupIntent,
    getPaymentMethod,
  } = useStripeTerminal();
  const [initialized, setInitialized] = useState(false);
  const [reader, setReader] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');

  const checkPermissions = async () => {
    console.log("Checking permissions", "Platform: " + Platform.OS);
    if (Platform.OS == 'android') {
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'Stripe Terminal needs access to your camera',
          buttonPositive: 'Accept',
        }
      );
      const locationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Stripe Terminal needs access to your location',
          buttonPositive: 'Accept',
        }
      );

      if (locationPermission === PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionsValidated(true);
      } else {
        console.log("Location services are required");
      }
    }
    else {
      // For iOS, we assume permissions are granted via the OS
      setPermissionsValidated(true);
    }
  };

  const initializeReader = async () => {
    console.log("Starting reader software");
    const { error, reader } = await initialize();
    if (reader) {
      console.log('initializeReader - found reader: ', reader);
    }
    if (error) {
      console.log('StripeTerminal init failed', error);
      return;
    }
    setInitialized(true);
  };

  useEffect(() => {
    console.log("Initialized state changed: ", initialized);
  }, [initialized]);

  const { discoverReaders, connectReader, disconnectReader } =
    useStripeTerminal({
      onUpdateDiscoveredReaders: (readers) => {
        console.log('onUpdateDiscoveredReaders', readers);
        if (readers.length > 0) {
          setReader(readers[0]);
          connectAODReader(readers[0]);
        }
      },
      onFinishDiscoveringReaders: (error) => {
        console.log("onFinishDiscoveringReaders", error ? error : "No error");
      },
      onDidChangeOfflineStatus: (status) => {
        console.log('onDidChangeOfflineStatus', status);
      },
      onDidSucceedReaderReconnect: () => {
        console.log("onDidSucceedReaderReconnect", "");
      },
      onDidChangePaymentStatus: (status) => {
        console.log('onDidChangePaymentStatus', status);
        setPaymentStatus(status);
      },
      onDidDisconnect: (reason) => {
        console.log('onDidDisconnect', reason);
      },
      onDidReportUnexpectedReaderDisconnect: (error) => {
        console.log('onDidReportUnexpectedReaderDisconnect', error);
      },
      onDidChangeConnectionStatus: (status) => {
        console.log('onDidChangeConnectionStatus', status);
      },
    });

  const discoverAODReader = async () => {
    console.log("Discovering AOD reader");
    // console.log("discoverAODReader", "Disconnecting handoff reader");
    // try {
    //   await disconnectReader();
    // }
    // catch (error) {
    //   console.log("discoverAODReader", "Error disconnecting reader: " + error);
    // }
    const { error } = await discoverReaders({
      discoveryMethod: 'handoff',
    });
    if (error) {
      console.log("discoverAODReader", error);
    }
  };

  const connectAODReader = async (reader) => {
    const { error } = await connectReader({
      reader: reader
    }, 'handoff');
    if (error) {
      console.log("connectHandoffReader", error);
      return;
    }
    return;
  };

  // PAYMENT INTENTS
  // Step 1 - create payment intent
  const pay = async (payload, onSuccess) => {
    if (paymentStatus !== 'ready') {
      return;
    }

    const { error, paymentIntent } = await createPaymentIntent(payload);
    if (error) {
      console.log("createPaymentIntent", error);
      return;
    }
    collectPM(paymentIntent, onSuccess);
  };

  // Step 2 - collect payment method
  const collectPM = async (pi, onSuccess) => {
    let payload = {
      paymentIntent: pi,
      allowRedisplay: 'always',
      customerConsentCollected: true,
    };

    const { error, paymentIntent } = await collectPaymentMethod(payload);
    if (error) {
      console.log("collectPaymentMethod", error);
      return;
    }
    confirmPayment(paymentIntent, onSuccess);
  };

  // Step 3 - confirm payment intent and call onSuccess function, passing to it the Payment Intent
  const confirmPayment = async (pi, onSuccess) => {
    let payload = {
      paymentIntent: pi
    };
    const { error, paymentIntent } = await confirmPaymentIntent(payload);
    if (error) {
      console.log("confirmPaymentIntent", error);
      return;
    }
    console.log("confirmPaymentIntent", paymentIntent);
    if (onSuccess) onSuccess(paymentIntent);
  };

  // LIFECYCLE HOOKS
  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    if (!permissionsValidated) return;
    initializeReader();
  }, [permissionsValidated]);

  useEffect(() => {
    console.log("Initialized: ", initialized);
    if (initialized) {
      discoverAODReader();
    }
  }, [initialized]);

  return (
    <View style={css.app}>
      <Text style={css.title}>Stripe Terminal React Native Demo</Text>
      <View style={css.container}>
        <SimplePayment pay={pay} reader={reader} paymentStatus={paymentStatus} />
      </View>
    </View>
  );
}
