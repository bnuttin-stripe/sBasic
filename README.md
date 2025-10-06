This project, built using React Native and Expo, aims to show a very simple implementation of `@stripe/stripe-terminal-react-native`.

> [!WARNING]
> This app is for demo purposes only and should never be used for live payments, as it contains very little error handling and no authentication.

The app allows the user to take a simple payment, as well as save a card against a customer profile.

It relies on a backend, the URL of which is defined in `.env`, to provide the connection token - per the "Set up the server" section of https://docs.stripe.com/terminal/quickstart.

The following code sample is running in our demo backend - it merely takes in the account ID passed by the app, and returns a connection token for that account, so it can be used for multiple demos. If only using for one demo account, initiate `stripe` only once at the top. It also has some routes for basic customer operations (since a customer object is needed to save a card). Adapt as needed.

```const express = require("express");
const app = express();
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

const cors = require("cors");
app.use(cors());
require("dotenv").config();

const PORT = 8080;

const initiateStripe = (account) => {
    let stripe = null;
    switch (account) {
        case "acct_1MZqgxxxxx":
            stripe = require("stripe")(process.env.SK_DEMO1);
            break;
        case "acct_8FGsqxxxxx":
            stripe = require("stripe")(process.env.SK_DEMO2);
            break;
        default:
            break;
    }
    return stripe;
}

app.post('/connection_token', async (req, res) => {
    const stripe = initiateStripe(req.body.account);
    if (!stripe) {
        res.status(400).send("Invalid account");
        return;
    }
    let connectionToken = await stripe.terminal.connectionTokens.create();
    res.json({ secret: connectionToken.secret });
});

app.post('/createCustomer', async (req, res) => {
    const stripe = initiateStripe(req.body.account);
    if (!stripe) {
        res.status(400).send("Invalid account");
        return;
    }
    const customer = await stripe.customers.create(req.body.payload);
    res.json(customer);
});

app.post('/getCustomers', async (req, res) => {
    const stripe = initiateStripe(req.body.account);
    if (!stripe) {
        res.status(400).send("Invalid account");
        return;
    }
    const customers = await stripe.customers.list({ limit: 100 });
    res.json(customers.data);
});

app.listen(PORT);
```