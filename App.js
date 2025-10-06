import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, Text, View } from 'react-native';
import Payment from './Payment';
import Setup from './Setup';
import Customer from './Customer';
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
    confirmSetupIntent
  } = useStripeTerminal();
  const [initialized, setInitialized] = useState(false);
  const [reader, setReader] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('notReady');
  const [customer, setCustomer] = useState(null);

  const checkPermissions = async () => {
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
      console.log("handleCollectPMForPayment", error);
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

  // Setup future payments
  // Step 1 - create setup intent
  const setup = async (customerId, onSuccess) => {
    const payload = customerId ? { customer: customerId } : {};
    const { error, setupIntent } = await createSetupIntent(payload);
    if (error) {
      Log("createSetupIntent", error);
      throw error;
    }
    return handleCollectPMForSetup(setupIntent, onSuccess);
  };

  // Step 2 - collect payment method
  const handleCollectPMForSetup = async (si, onSuccess) => {
    const { setupIntent, error } = await collectSetupIntentPaymentMethod({
      setupIntent: si,
      allowRedisplay: "always",
      customerConsentCollected: true
    });
    if (error) {
      Log("handleCollectPMForSetup", error);
      throw error;
    }
    return handleConfirmSetupIntent(setupIntent, onSuccess);
  };

  // Step 3 - confirm setup intent and call onSuccess function, passing to it the Setup Intent
  const handleConfirmSetupIntent = async (si, onSuccess) => {
    const { setupIntent, error } = await confirmSetupIntent({
      setupIntent: si,
    });
    if (error) {
      Log("confirmSetupIntent", error);
      throw error;
    }
    if (onSuccess) onSuccess(setupIntent);
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
      <Text style={css.title}>Stripe Terminal Demo</Text>
      <View style={css.container}>
        <View style={css.instructions}>
          <Text style={css.subTitle}>Instructions</Text>
          <Text style={css.defaultText}>Use this demo to run the following scenarios:</Text>
          <Text style={css.defaultText}>- Pay $10 with or without a customer</Text>
          <Text style={css.defaultText}>- If you set a customer, you can also save the card used for the payment to the customer's profile</Text>
          <Text style={css.defaultText}>- If you set a customer, save a card to their profile without charging it</Text>
        </View>
        <Customer customer={customer} setCustomer={setCustomer} />
        <Payment
          pay={pay}
          reader={reader}
          paymentStatus={paymentStatus}
          customer={customer}
        />
        <Setup
          setup={setup}
          reader={reader}
          paymentStatus={paymentStatus}
          customer={customer}
        />
      </View>
      <Text>Reader Status: {paymentStatus}</Text>
    </View>
  );
}
