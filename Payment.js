import { useState, useEffect } from 'react';
import { Pressable, View, Text, ActivityIndicator, Switch } from 'react-native';
import { css } from './styles';

export default function Payment(props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  const processPayment = async () => {
    setIsProcessing(true);
    if (!props.reader) {
      console.log("No reader connected");
      return;
    }
    const payload = {
      currency: 'usd',
      amount: 1000,
      captureMethod: 'automatic',
      paymentMethodTypes: ['card_present']
    };
    if (props.customer) {
      payload.customer = props.customer.id;
      if (saveCard) payload.setupFutureUsage = 'off_session';
    }
    props.pay(payload, () => { setIsProcessing(false); });
  };


  return (
    <View>
      <Pressable style={(isProcessing || props.paymentStatus !== 'ready') ? css.buttonDisabled : css.button} onPress={processPayment} disabled={isProcessing || props.paymentStatus !== 'ready'}>
        {isProcessing
          ? <ActivityIndicator size="small" color="white" />
          : <Text style={css.buttonText}>Pay $10</Text>
        }
      </Pressable>
      {props.customer && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 10, marginTop: 10 }}>
        <Text>Save card after payment</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#ada0ffff' }}
          thumbColor={saveCard ? '#533AFD' : '#f4f3f4'}
          onValueChange={() => { setSaveCard(!saveCard); }}
          value={saveCard}
          disabled={props.customer ? false : true}
        />
      </View>}
    </View>
  );
}
