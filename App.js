// React
import { useEffect } from 'react';
import { Text, View, Pressable } from 'react-native';
// Hooks and contexts
import usePermissions from './hooks/usePermissions';
import useStripeTerminalSetup from './hooks/useStripeTerminalSetup';
import { PaymentProvider } from "./contexts/PaymentContext";
// Data
import { useAtom } from 'jotai';
import { pageAtom, customerAtom } from './data/atoms';
import { api } from './data/api';
// Components and pages
import Products from './pages/Products';
import Payment from './pages/Payment';
// Utils
import { colors, css } from './utils/styles';
import * as d from './utils/display';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink, faLinkSlash } from '@fortawesome/free-solid-svg-icons';

export default function App() {
  const [page, setPage] = useAtom(pageAtom);
  const [customer, setCustomer] = useAtom(customerAtom);

  // Stripe Terminal setup
  const { permissionsValidated } = usePermissions();
  const {
    initialized,
    paymentStatus,
    initializeReader,
    discoverReaderAndConnect
  } = useStripeTerminalSetup({ isAOD: true });

  // Once permissions are granted, initialize Stripe Terminal
  useEffect(() => {
    if (!permissionsValidated) return;
    initializeReader();
  }, [permissionsValidated]);

  // When reader is initialized and account is set, discover and connect to reader
  useEffect(() => {
    if (initialized) {
      discoverReaderAndConnect();
    }
  }, [initialized]);

  useEffect(() => {
    api.getCustomers().then(customers => {
      if (customers.length > 0) {
        setCustomer(customers[0]);
      }
    });
  }, []);

  return (
    <PaymentProvider>
      <View style={css.app}>
        {/* <Pressable style={css.header} onPress={() => setPage('payment')}> */}
          {/* <Text style={[css.title, { color: colors.light }]}>Stripe Terminal</Text> */}
          {/* <FontAwesomeIcon icon={paymentStatus === 'ready' ? faLink : faLinkSlash} color={colors.light} />
        </Pressable> */}
        <View style={css.container}>
          {page === 'products' && <Products />}
          {page === 'payment' && <Payment paymentStatus={paymentStatus} customer={customer} />}
        </View>
      </View>
    </PaymentProvider>
  );
}
