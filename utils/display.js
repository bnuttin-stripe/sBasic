export const displayPrice = (amount, currency, round) => {
    if (amount === null || isNaN(amount) || currency == undefined) return ' - ';
    if (['jpy'].includes(currency)) {
        round = true;
    }
    else {
        amount = amount / 100;
    }
    return Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: round ? 0 : 2,
        minimumFractionDigits: round ? 0 : 2,
    }).format(amount);
};

export const displayDate = (timestamp, locale) => {
    if (locale === undefined || locale === null) {
        locale = 'en-US';
    }
    let date = new Intl.DateTimeFormat(locale, { year: '2-digit', month: '2-digit', day: '2-digit' }).format(timestamp * 1000);
    return date;
};

export const displayDateTime = (timestamp, locale) => {
    if (locale === undefined || locale === null) {
        locale = 'en-US';
    }
    let date = new Intl.DateTimeFormat(locale, { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timestamp * 1000);
    return date;
};

export const displayDateTimeShort = (timestamp, locale) => {
    if (locale === undefined || locale === null) {
        locale = 'en-US';
    }
    let date = new Intl.DateTimeFormat(locale, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timestamp * 1000);
    return date;
};

export const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    s = s.replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export const capitalizeWords = (s) => {
    return s.split(' ').map(word => word.toLowerCase()).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

};

export const isValidEmail = (email) => {
    if (email === undefined) return false;
    return email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
};

export const defaultAddress = {
    line1: '350 N. Orleans St.',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    postalCode: '60654'
};

export const generateOrderNumber = (prefix) => {
    return (prefix || 'Order-') + Math.floor(10000 + Math.random() * 90000);
};

export const getCurrencyFromCountry = (country) => {
    switch (country) {
        case 'US':
            return 'usd';
        case 'CA':
            return 'cad';
        case 'GB':
            return 'gbp';
        case 'AU':
            return 'aud';
        case 'IE':
            return 'eur';
        case 'NL':
            return 'eur';
        case 'FR':
            return 'eur';
        case 'FI':
            return 'eur';
        default:
            return 'usd';
    }
};

export const translateInterval = (interval, language) => {
    switch (language) {
        case 'en-US':
            return interval;
        case 'fr':
            return interval.replace('day', 'jour').replace('week', 'semaine').replace('month', 'mois').replace('year', 'an');
        case 'jp':
            return interval.replace('day', '日').replace('week', '週').replace('month', '月').replace('year', '年');
        default:
            return interval;
    }
};

export const isColorDark = (color) => {
    const rgb = color.match(/(?!#).{2}/g);
    if (!rgb) return true;
    const [r, g, b] = rgb.map(code => parseInt(code, 16));
    const brightness = Math.sqrt(r * r * 0.299 + g * g * 0.587 + b * b * 0.114);
    return brightness < 160;
};

export const subDefaultPM = (subscription) => {
    return capitalize(subscription?.default_payment_method?.card?.brand) + ' - ' + subscription?.default_payment_method?.card?.last4;
};

export const camelToTitle = (camelStr) => {
    const spaced = camelStr.replace(/([a-z])([A-Z])/g, '$1 $2');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};