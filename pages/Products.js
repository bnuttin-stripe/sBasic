// React
import { useState, useEffect } from 'react';
import { FlatList, Text, View, Pressable } from 'react-native';
// Data
import { api } from '../data/api';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { pageAtom, productsAtom, cartAtom, addToCartAtom, resetCartAtom } from '../data/atoms';
// Components and pages
import Button from '../components/Button';
// Utils
import { faCartShopping, faTrash, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { css, colors } from '../utils/styles';
import * as d from '../utils/display';

export default function Products() {
  const setPage = useSetAtom(pageAtom);

  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useAtom(productsAtom);

  const addToCart = useSetAtom(addToCartAtom);
  const cart = useAtomValue(cartAtom);
  const resetCart = useSetAtom(resetCartAtom);

  const getProducts = async () => {
    setIsLoading(true);
    const products = await api.getProducts();
    // Only show active products that aren't subscriptions for this demo
    setProducts(products.filter(p => p.active && !p.default_price?.recurring));
    setIsLoading(false);
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <View style={{ padding: 20, paddingBottom: 10 }}>
        <Text style={css.title}>Products</Text>
      </View>

      <FlatList
        style={{ flex: 1, paddingHorizontal: 20 }}
        data={products}
        keyExtractor={(item) => item?.id}
        renderItem={({ item }) => (
          <Pressable
            style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
            onPress={() => addToCart(item)}
          >
            <Text style={{ fontSize: 18 }}>{item?.name}</Text>
            <Text>{d.displayPrice(item?.default_price?.unit_amount, item?.default_price?.currency)}</Text>
          </Pressable>
        )}
        refreshing={isLoading}
      // onRefresh={getProducts}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', padding: 20, gap: 20, backgroundColor: colors.medium}}>
        <Button
          text={cart.length + " Items"}
          action={() => setPage('cart')}
          disabled={cart.length === 0}
          icon={faCartShopping}
        />
        <Button
          text={"Empty"}
          action={resetCart}
          disabled={cart.length === 0}
          icon={faTrash}
        />
        <Button
          // text="Refresh"
          action={getProducts}
          refreshing={isLoading}
          disabled={isLoading}
          icon={faArrowsRotate}
        />
      </View>
    </View>
  );
}
