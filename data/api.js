// All API calls to the backend are defined here
const backendUrl = process.env.EXPO_PUBLIC_API_URL;
const account = process.env.EXPO_PUBLIC_ACCOUNT;

export const api = {
    getConnectionToken: async () => {
        const response = await fetch(`${backendUrl}/connection_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'account': account
            }
        });
        return await response.json();
    },

    getCustomers: async () => {
        const response = await fetch(backendUrl + '/customers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'account': account
            }
        });
        return await response.json();
    },

    getPaymentIntent: async (id) => {
        console.log('Fetching Payment Intent details for ID:', id);
        const response = await fetch(backendUrl + '/payment_intents/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'account': account
            },
        });
        return await response.json();
    },

    createCustomer: async (payload) => {
        const response = await fetch(backendUrl + '/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'account': account
            },
            body: JSON.stringify({
                payload: payload
            })
        });
        return await response.json();
    },

    createSubscription: async (payload) => {
        const response = await fetch(backendUrl + '/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'account': account
            },
            body: JSON.stringify(payload)
        });
        return await response.json();
    },

    createSubscriptionSchedule: async (payload) => {
        const response = await fetch(backendUrl + '/subscription_schedules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'account': account
            },
            body: JSON.stringify(payload)
        });
        return await response.json();
    },

    // sendPaymentResult: async (payload) => {
    //     const paymentStatus = payload.status;
    //     const tier = payload.metadata.tier;
    //     console.log('\nSending Payment Result to Websocket\nPayment Status: ' + paymentStatus + '\n Tier: ' + tier);
    //     const response = await fetch(backendUrl + '/broadcast/carwash', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             payment: 'success',
    //             type: tier,
    //         }),
    //     })
    // },

    getProducts: async () => {
        const response = await fetch(backendUrl + '/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'account': account
            }
        });
        return await response.json();
    }
};