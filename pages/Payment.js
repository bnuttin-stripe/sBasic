// React
import { useState, useEffect } from 'react';
import { FlatList, Text, View, Pressable } from 'react-native';
// Hooks and contexts
import { usePayment } from '../contexts/PaymentContext';
// Data
import { api } from '../data/api';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { pageAtom, productsAtom, cartAtom, addToCartAtom, resetCartAtom } from '../data/atoms';
// Components and pages
import Button from '../components/Button';
import Logger from '../components/Logger';
// Utils
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { css, colors } from '../utils/styles';
import * as d from '../utils/display';

export default function Payment(props) {
  const { pay } = usePayment();
  const [isProcessing, setIsProcessing] = useState(false);

  const { Log } = Logger('Payment');

  const processPayment = async () => {
    setIsProcessing(true);
    const payload = {
      currency: 'usd',
      amount: 1000,
      captureMethod: 'automatic',
      paymentMethodTypes: ['card_present']
    };
    pay(payload, postPayment );
  };

  const postPayment = async (paymentIntent) => {
    Log('Payment done', paymentIntent);
    setIsProcessing(false);
  }

  return (
    <View>
      <Button
        text="Pay $10"
        action={processPayment}
        disabled={isProcessing || props.paymentStatus !== 'ready'}
        icon={faDollarSign}
        refreshing={isProcessing}
      />
    </View>
  );
}
