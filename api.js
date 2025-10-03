const backendUrl = process.env.EXPO_PUBLIC_API_URL;
const account = process.env.EXPO_PUBLIC_ACCOUNT;

export const api = {
    getConnectionToken: async () => {
        const response = await fetch(`${backendUrl}/connection_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                account: account
            })
        });
        return await response.json();
    },

    getCustomers: async () => {
        const response = await fetch(backendUrl + '/getCustomers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                account: account,
            })
        });
        return await response.json();
    },

    createCustomer: async (payload) => {
        const response = await fetch(backendUrl + '/createCustomer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                account: account,
                payload: payload
            })
        });
        return await response.json();
    }
};