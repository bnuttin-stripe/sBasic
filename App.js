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

  // Terminal hooks and events
  const { discoverReaders, connectReader, disconnectReader } =
    useStripeTerminal({
      onUpdateDiscoveredReaders: (readers) => {
        console.log('onUpdateDiscoveredReaders', readers);
        if (readers.length > 0) {
          setReader(readers[0]);
          handleReaderConnection(readers[0]);
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

  // Discovery and connection
  const handleReaderDiscovery = async () => {
    try {
      await disconnectReader();
    } catch (error) {
      Log("Error disconnecting reader: ", error);
    }
    
    console.log("Discovering handoff reader");
    const { error } = await discoverReaders({
      discoveryMethod: 'handoff',
    });
    if (error) {
      console.log("handleReaderDiscovery", error);
    }
  };

  const handleReaderConnection = async (reader) => {
    const { error } = await connectReader({
      reader: reader
    }, 'handoff');
    if (error) {
      console.log("connectHandoffReader", error);
      return;
    }
    return;
  };

  // Payments
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
    handleCollectPMForPayment(paymentIntent, onSuccess);
  };

  // Step 2 - collect payment method
  const handleCollectPMForPayment = async (pi, onSuccess) => {
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
    handleConfirmPaymentIntent(paymentIntent, onSuccess);
  };

  // Step 3 - confirm payment intent and call onSuccess function, passing to it the Payment Intent
  const handleConfirmPaymentIntent = async (pi, onSuccess) => {
    let payload = {
      paymentIntent: pi
    };
    const { error, paymentIntent } = await confirmPaymentIntent(payload);
    if (error) {
      console.log("handleConfirmPaymentIntentIntent", error);
      return;
    }
    console.log("handleConfirmPaymentIntentIntent", paymentIntent);
    if (onSuccess) onSuccess(paymentIntent);
  };

  // LIFECYCLE HOOKS
  // Step 1 - Check permissions
  useEffect(() => {
    checkPermissions();
  }, []);

  // Step 2 - Initialize reader when permissions are granted
  useEffect(() => {
    if (!permissionsValidated) return;
    initializeReader();
  }, [permissionsValidated]);

  // Step 3 - Discover readers when initialized
  useEffect(() => {
    if (initialized) {
      handleReaderDiscovery();
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
