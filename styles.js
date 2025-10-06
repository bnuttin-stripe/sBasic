export const defaults = {
    fontSize: 14,
};

export const css = {
    app: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        margin: 30
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    title: {
        fontSize: 26,
        marginBottom: 20,
        fontWeight: 600
    },
    subTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 600

    },
    defaultText: {
        fontSize: defaults.fontSize,
        marginBottom: 5
    },
    instructions: {
        marginBottom: 40,
        borderWidth: 1,
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'whitesmoke',
        width: 300
    },
    button: {
        backgroundColor: '#533AFD',
        padding: 15,
        borderRadius: 5,
        width: 300,
        alignItems: 'center',
        marginTop: 35,
        height: 48
    },
    buttonDisabled: {
        backgroundColor: '#d0c9fcff',
        padding: 15,
        borderRadius: 5,
        width: 300,
        alignItems: 'center',
        marginTop: 35,
        height: 48
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        width: 300,
    },
};