import { Text, View } from 'react-native';
import Button from '../components/Button';

import { useSetAtom } from 'jotai';
import { pageAtom } from '../data/atoms';

import { colors, css } from '../utils/styles';
import { faCartShopping, faDollarSign } from '@fortawesome/free-solid-svg-icons';

export default function Welcome() {
    const setPage = useSetAtom(pageAtom);

    return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 30, padding: 20 }}>
        <Text style={css.title}>Welcome to sBasic</Text>
        <Text style={[css.text, { textAlign: 'center', marginBottom: 30 }]}>Use this application as a bootstrap for Stripe Terminal demos, using the React Native SDK.</Text>
        <Button
            action={() => setPage('products')}
            icon={faCartShopping}
            text="View Products"
        />
        <Button
            action={() => setPage('payment')}
            icon={faDollarSign}
            text="Test Payment"
        />
    </View>
    );
}
