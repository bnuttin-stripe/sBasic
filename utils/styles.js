import { StyleSheet } from 'react-native';

export const defaults = {
    fontFamily: 'Roboto',
    fontSize: 14,
    spacing: 20,
};

export const colors = {
    primary: '#533AFD',
    secondary: '#d0c9fc',
    slate: '#061B31',
    medium: '#eee',
    light: '#F6F9FC',
};

export const css = StyleSheet.create({
    app: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    container: {
        flex: 1,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: defaults.spacing,
        backgroundColor: '#000',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: colors.slate,
    },
});