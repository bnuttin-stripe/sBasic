import { Text, View } from 'react-native';
import Button    from '../components/Button';

import { useSetAtom } from 'jotai';
import { pageAtom } from '../data/atoms';

import { faCartShopping, faDollarSign } from '@fortawesome/free-solid-svg-icons';

export default function Welcome() {
    const setPage = useSetAtom(pageAtom);

    return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <Text>Hello World</Text>
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
