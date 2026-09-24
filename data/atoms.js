import { atom } from 'jotai';

// The easy stuff
export const pageAtom = atom('payment');
export const logAtom = atom(/** @type {any[]} */ ([]));
export const productsAtom = atom(/** @type {any[]} */ ([]));

export const settingsAtom = atom({
    taxPercentage: 10,
    magicCentProtection: true,
    currency: 'usd',
});

export const customerAtom = atom();

// Cart functionality

// Usage:
// const addToCart = useSetAtom(addToCartAtom);
// addToCart(productObject);

// const removeFromCart = useSetAtom(removeFromCartAtom);
// removeFromCart(productId);
// Note: removes the first instance of the product in the cart, not all instances

// const resetCart = useSetAtom(resetCartAtom);
// resetCart();

const cartItemsAtom = atom(/** @type {any[]} */ ([]));

const adjustFinalAmount = (amount) => {
  let output = 0;
  const decimal = amount.toString().slice(-2);
  if (["01", "02", "03", "05", "40", "55", "65", "75", "80"].includes(decimal)) {
    output = 100 - parseInt(decimal);
  }
  return output;
};

const getCartTotal = (items, { taxPercentage, currency, magicCentProtection }) => {
  let subtotal = items.reduce((a, b) => a + b.default_price.unit_amount, 0);

  // Add taxes only for USD
  const taxes = currency === "usd" ? Math.round(subtotal * (taxPercentage / 100)) : 0;
  const adjustment = magicCentProtection ? adjustFinalAmount(subtotal + taxes) : 0;
  const total = subtotal + taxes + adjustment;

  return {
    subtotal: subtotal,
    taxes: taxes,
    adjustment: adjustment,
    total: total,
  };
};

export const cartAtom = atom(
  (get) => {
    const items = get(cartItemsAtom);
    const settings = get(settingsAtom);
    const totals = getCartTotal(items, {
      taxPercentage: settings.taxPercentage,
      currency: settings.currency,
      magicCentProtection: settings.magicCentProtection,
    });

    return {
      items,
      length: items.length,
      subtotal: totals.subtotal,
      taxes: totals.taxes,
      adjustment: totals.adjustment,
      total: totals.total,
    };
  },
  (get, set, update) => {
    const currentItems = get(cartItemsAtom);
    const currentCart = {
      items: currentItems,
    };
    const nextCart = typeof update === 'function' ? update(currentCart) : update;

    set(cartItemsAtom, nextCart?.items ?? currentItems);
  }
);

// Cart Actions
export const addToCartAtom = atom(null, (get, set, product) => {
  const currentCart = get(cartAtom);
  const nextProduct = product;

  set(cartAtom, {
    ...currentCart,
    items: [...currentCart.items, nextProduct],
  });
});

export const removeFromCartAtom = atom(null, (get, set, productId) => {
  const currentCart = get(cartAtom);
  const nextProductId = productId;
  const itemIndex = currentCart.items.findIndex((item) => item.id === nextProductId);

  if (itemIndex !== -1) {
    const updatedItems = currentCart.items.toSpliced(itemIndex, 1);
    set(cartAtom, {
      ...currentCart,
      items: updatedItems,
    });
  }
});

export const resetCartAtom = atom(null, (_get, set) => {
  set(cartItemsAtom, []);
});