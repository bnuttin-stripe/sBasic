import { useState } from 'react';
import { Pressable, View, Text, ActivityIndicator } from 'react-native';
import { css } from './styles';

export default function Payment(props) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processSetup = async () => {
    setIsProcessing(true);
    if (!props.reader) {
      console.log("No reader connected");
      return;
    }
    props.setup(props.customer?.id, () => { setIsProcessing(false) });
  };

  return (
    <View>
      <Pressable style={(isProcessing || !props.customer || props.paymentStatus !== 'ready') ? css.buttonDisabled : css.button} onPress={processSetup} disabled={isProcessing || props.paymentStatus !== 'ready'}>
        {props.customer
          ? isProcessing
            ? <ActivityIndicator size="small" color="white"/>
            : <Text style={css.buttonText}>Save Card Only</Text>
          : <Text style={css.buttonText}>Save Card Only</Text>
        }
      </Pressable>
    </View>
  );
}
