import { useEffect } from 'react';
import { Pressable, View, Text } from 'react-native';
import { css } from './styles';

export default function SimplePayment(props) {
  useEffect(() => {
    console.log("Payment status: ", props.paymentStatus);
  }, [props.paymentStatus]);

  useEffect(() => {
    console.log("Reader: ", props.reader);
  }, [props.reader]);

  const processPayment = async () => {
    console.log("Processing payment...");
    if (!props.reader) {
      console.log("No reader connected");
      return;
    }
    if (props.paymentStatus === 'in_progress') {
      console.log("Payment in progress, please wait");
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
      <Pressable style={css.button} onPress={processPayment}>
        <Text style={css.buttonText}>Simple Payment</Text>
      </Pressable>
    </View>
  );
}
