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