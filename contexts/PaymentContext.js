// This context provides payment-related functions for the app.

import { createContext, useContext, useCallback } from 'react';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import Logger from '../components/Logger';

const PaymentContext = createContext({});
export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }) => {
    const { Log } = Logger('PaymentProvider');
    
    const {
        createPaymentIntent,
        collectPaymentMethod,
        confirmPaymentIntent,
        createSetupIntent,
        collectSetupIntentPaymentMethod,
        confirmSetupIntent,
        collectData
    } = useStripeTerminal();

    const pay = useCallback(async (payload, onSuccess) => {
        // Create PI
        const createResult = await createPaymentIntent(payload);
        Log("Created Payment Intent", createResult);
        if (createResult.error) {
            Log('createPaymentIntent', createResult.error);
            throw createResult.error;
        }

        // Collect PM
        const collectResult = await collectPaymentMethod({
            paymentIntent: createResult.paymentIntent,
            allowRedisplay: 'always',
            // updatePaymentIntent: true,
            // requestDynamicCurrencyConversion: true,
        });
        Log("Collected Payment Method", collectResult);
        if (collectResult.error) {
            Log('collectPaymentMethod', collectResult.error);
            throw collectResult.error;
        }

        // Confirm PI
        const confirmResult = await confirmPaymentIntent({
            paymentIntent: collectResult.paymentIntent,
        });
        Log("Confirmed Payment Intent", confirmResult);
        if (confirmResult.error) {
            Log('confirmPaymentIntent', confirmResult.error);
            throw confirmResult.error;
        }
        if (onSuccess) onSuccess(confirmResult.paymentIntent);
    }, [createPaymentIntent, collectPaymentMethod, confirmPaymentIntent]);

    const setup = useCallback(async (payload, onSuccess) => {
        // Create SI
        const createResult = await createSetupIntent(payload);
        Log("Created Setup Intent", createResult);
        if (createResult.error) {
            Log('createSetupIntent', createResult.error);
            throw createResult.error;
        }

        // Collect PM
        const collectResult = await collectSetupIntentPaymentMethod({
            setupIntent: createResult.setupIntent,
            allowRedisplay: 'always',
        });
        Log("Collected Payment Method", collectResult);
        if (collectResult.error) {
            Log('collectPaymentMethod', collectResult.error);
            throw collectResult.error;
        }

        // Confirm SI
        const confirmResult = await confirmSetupIntent({
            setupIntent: collectResult.setupIntent,
        });
        Log("Confirmed Setup Intent", confirmResult);
        if (confirmResult.error) {
            Log('confirmSetupIntent', confirmResult.error);
            throw confirmResult.error;
        }
        if (onSuccess) onSuccess(confirmResult.setupIntent);
    }, [createSetupIntent, collectSetupIntentPaymentMethod, confirmSetupIntent]);

    return (
        <PaymentContext.Provider value={{ setup, pay, collectData }}>
            {children}
        </PaymentContext.Provider>
    );
};
