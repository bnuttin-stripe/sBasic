// React
import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
// Hooks and contexts
import { usePayment } from '../contexts/PaymentContext';
// Data
import { api } from '../data/api';
// Components and pages
import Logger from '../components/Logger';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink, faLinkSlash, faCheck, faCar } from '@fortawesome/free-solid-svg-icons';
import { colors, css } from '../utils/styles';

const PAY_OPTIONS = [
  {
    id: 'paynow',
    label: 'Pay Now',
    perDay: 5,
    color: '#F9CB40',
  },
  {
    id: 'paylater',
    label: 'Pay Later',
    perDay: 10,
    color: '#F0F0F0',
  },
];

// const CUSTOMER = 'cus_VJqoQVqcLx4pOb';
const RECURRING_PRODUCT = 'prod_VJrgyH1djPF2Jz';

export default function Payment({ paymentStatus, customer }) {
  const { pay, setup } = usePayment();
  const [processingOptionId, setProcessingOptionId] = useState(null);
  const [processingSub, setProcessingSub] = useState(false);
  const [subscriptionCreated, setSubscriptionCreated] = useState(false);
  const [lastPaymentIntent, setLastPaymentIntent] = useState(null);

  const [succeededOptionId, setSucceededOptionId] = useState(null);
  const [days, setDays] = useState(1);
  const [stackHeight, setStackHeight] = useState(null);

  const { Log } = Logger('Payment');

  const decrementDays = () => setDays((current) => Math.max(1, current - 1));
  const incrementDays = () => setDays((current) => current + 1);

  const handleReset = () => {
    setSucceededOptionId(null);
    setProcessingOptionId(null);
    setProcessingSub(false);
    setSubscriptionCreated(false);
    setDays(1);
  };

  const handleOptionPress = async (option) => {
    if (processingOptionId || paymentStatus !== 'ready') return;
    setSucceededOptionId(null);
    setProcessingOptionId(option.id);

    const onDone = (label) => (result) => {
      Log(`${label} done`, result);
      if (label === 'Payment') {
        setLastPaymentIntent(result);
      }
      if (result.status === 'succeeded') {
        setSucceededOptionId(option.id);
      }
      setProcessingOptionId(null);
    };

    if (option.id === 'paylater') {
      // Setup Intent
      const payload = {
        customer: customer?.id,
        paymentMethodTypes: ['card_present'],
      };
      await setup(payload, onDone('Setup Intent'));
    }
    else if (option.id === 'paynow') {
      // Payment Intent
      const payload = {
        customer: customer?.id,
        currency: 'usd',
        amount: option.perDay * days * 100,
        captureMethod: 'automatic',
        paymentMethodTypes: ['card_present'],
        metadata: { option: option.id, days: String(days) },
        setupFutureUsage: 'off_session',
      };
      await pay(payload, onDone('Payment'));
    }
  };

  const startSubscriptionOld = async (paymentIntent) => {
    if (processingSub) return;
    setProcessingSub(true);
    Log('Starting subscription based on payment intent', paymentIntent);
    if (!paymentIntent) {
      Log('startSubscription called without a paymentIntent');
      setProcessingSub(false);
      return;
    }
    const paymentIntentDetails = await api.getPaymentIntent(paymentIntent.id);
    console.log('Payment Intent details:', paymentIntentDetails?.latest_charge?.payment_method_details?.card_present?.generated_card);
    try {
      const payload = {
        customer: customer?.id,
        default_payment_method: paymentIntentDetails?.latest_charge?.payment_method_details?.card_present?.generated_card,
        items: [
          {
            price_data: {
              currency: 'usd',
              product: RECURRING_PRODUCT,
              unit_amount: Math.round(PAY_OPTIONS.find(o => o.id === 'paylater').perDay * days * 100 * 0.80), // 20% discount
              recurring: { interval: 'week' },
            },
            quantity: 1,
          },
        ],
        // Stop after 4 weekly installments
        cancel_at: Math.floor(Date.now() / 1000) + 4 * 7 * 24 * 60 * 60,
        expand: ['latest_invoice.payment_intent'],
      };
      console.log('Subscription payload:', payload);
      // return;
      const response = await api.createSubscription(payload);
      Log('Subscription created', response.data);
    } catch (error) {
      Log('Error creating subscription', error);
    } finally {
      setProcessingSub(false);
    }
  };

  const startSubscription = async (paymentIntent) => {
    if (processingSub) return;
    setProcessingSub(true);
    if (!paymentIntent) {
      setProcessingSub(false);
      return;
    }
    const paymentIntentDetails = await api.getPaymentIntent(paymentIntent.id);
    try {
      const payload = {
        customer: customer?.id,
        start_date: 'now',
        end_behavior: 'cancel',
        default_settings: {
          default_payment_method: paymentIntentDetails?.latest_charge?.payment_method_details?.card_present?.generated_card,
        },
        phases: [
          {
            description: 'Weekly subscription - ' + days + ' days per week',
            items: [
              {
                price_data: {
                  currency: 'usd',
                  product: RECURRING_PRODUCT,
                  unit_amount: Math.round(PAY_OPTIONS.find(o => o.id === 'paynow').perDay * days * 100 * 0.80), // 20% discount
                  recurring: { interval: 'week' },
                },
                quantity: 1,
              }
            ],
            iterations: 4,
          },
        ],
      };
      console.log('Subscription payload:', payload);
      // return;
      const response = await api.createSubscriptionSchedule(payload);
      Log('Subscription created', response.data);
      setSubscriptionCreated(true);
    } catch (error) {
      Log('Error creating subscription', error);
    } finally {
      setProcessingSub(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/ParkingBackground.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <FontAwesomeIcon icon={faCar} color={colors.light} />
            <Text style={styles.customerName}>{customer?.name}</Text>
            <Pressable
              style={[styles.resetButton, !succeededOptionId && styles.resetButtonHidden]}
              onPress={handleReset}
              disabled={!succeededOptionId}
              pointerEvents={succeededOptionId ? 'auto' : 'none'}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </Pressable>
          </View>
          <FontAwesomeIcon icon={paymentStatus === 'ready' ? faLink : faLinkSlash} color={colors.light} />
        </View>
        <Image
          source={require('../assets/images/ParkingSpotLogo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.daysRow}>
          <Pressable style={styles.daysButton} onPress={decrementDays}>
            <Text style={styles.daysButtonText}>−</Text>
          </Pressable>
          <Text style={styles.daysNumber}>{days} {days === 1 ? 'day' : 'days'}</Text>
          <Pressable style={styles.daysButton} onPress={incrementDays}>
            <Text style={styles.daysButtonText}>+</Text>
          </Pressable>
        </View>

        <View
          style={styles.optionStack}
          onLayout={(event) => {
            if (!succeededOptionId) setStackHeight(event.nativeEvent.layout.height);
          }}
        >
          {(succeededOptionId ? PAY_OPTIONS.filter((option) => option.id === succeededOptionId) : PAY_OPTIONS).map((option) => {
            const isProcessing = processingOptionId === option.id;
            const isSucceeded = succeededOptionId === option.id;
            const expandOnSuccess = isSucceeded;
            const total = option.perDay * days;
            return (
              <Pressable
                key={option.id}
                style={[styles.optionCard, expandOnSuccess && stackHeight != null && { height: stackHeight }]}
                onPress={() => handleOptionPress(option)}
                disabled={!!processingOptionId || isSucceeded}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionHeaderText}>{option.label}</Text>
                </View>
                <View style={[styles.optionBody, { backgroundColor: option.color }, expandOnSuccess && styles.optionBodyTop]}>
                  {isProcessing ? (
                    <ActivityIndicator size="large" color="#000" />
                  ) : isSucceeded ? (
                    <>
                      <View style={styles.successRow}>
                        <FontAwesomeIcon icon={faCheck} size={32} color="#000" />
                        <Text style={styles.successText}>Thank you!</Text>
                      </View>
                      {option.id === 'paynow' ? (
                        <View style={styles.remainingArea}>
                          {!subscriptionCreated && (
                            <Pressable
                              style={styles.pillButton}
                              onPress={() => startSubscription(lastPaymentIntent)}
                              disabled={processingSub}
                            >
                              {processingSub ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <Text style={styles.pillButtonText}>Sign Up Weekly?</Text>
                              )}
                            </Pressable>
                          )}
                          <Text style={styles.pillSubtext}>
                            {subscriptionCreated
                              ? 'Your parking is all set for the next 4 weeks! \n\nYour card on file will be charged automatically every week.'
                              : 'Sign up for the same amount of days for the next 4 weeks and get a 20% discount!'}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.remainingArea}>
                          <Text style={styles.pillSubtext}>
                            Your credit card will be charged upon checking out
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={styles.optionPrice}>${total.toFixed(2)}</Text>
                      <Text style={styles.optionPerDay}>${option.perDay.toFixed(2)}/day</Text>
                    </>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignSelf: 'stretch',
  },
  container: {
    flex: 1,
    alignSelf: 'stretch',
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light,
  },
  resetButton: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetButtonHidden: {
    opacity: 0,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  logo: {
    alignSelf: 'center',
    width: 300,
    height: 150,
    marginBottom: 20,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 44,
  },
  daysButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysButtonText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
  },
  daysNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    minWidth: 120,
    textAlign: 'center',
  },
  optionStack: {
    flexDirection: 'column',
    gap: 32,
  },
  optionCard: {
    alignSelf: 'center',
    width: 300,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  optionHeader: {
    backgroundColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
  },
  optionHeaderText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  optionBody: {
    minHeight: 110,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBodyTop: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  optionPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
  },
  optionPerDay: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#555',
    marginTop: 2,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  remainingArea: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButton: {
    backgroundColor: '#000',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  pillButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  pillSubtext: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
});
