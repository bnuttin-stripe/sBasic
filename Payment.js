import { useState } from 'react';
import { Pressable, View, Text, ActivityIndicator } from 'react-native';
import { css } from './styles';

export default function Payment(props) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = async () => {
    if (!props.reader) {
      console.log("No reader connected");
      return;
    }
    const payload = {
      currency: 'usd',
      amount: 1099,
      captureMethod: 'automatic',
      paymentMethodTypes: ['card_present']
    };
    props.pay(payload, () => { });
  };

  return (
    <View>
      <Pressable style={css.button} onPress={processPayment} disabled={!isProcessing}>
        {!isProcessing
          ? <ActivityIndicator size="small" color="white"/>
          : <Text style={css.buttonText}>Simple Payment</Text>
        }
      </Pressable>
    </View>
  );
}
