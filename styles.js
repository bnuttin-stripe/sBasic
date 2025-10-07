export const defaults = {
    fontSize: 14,
    spacing: 35,
    contentWidth: 340,
    primary: '#533AFD',
    secondary: '#d0c9fc',
    slate: '#061B31',
    light: '#F6F9FC'
};

export const css = {
    app: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        margin: defaults.spacing
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        marginBottom: defaults.spacing,
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        backgroundColor: defaults.light,
        width: defaults.contentWidth,
        borderColor: defaults.slate
    },
    button: {
        backgroundColor: defaults.primary,
        padding: 15,
        borderRadius: 5,
        width: defaults.contentWidth,
        alignItems: 'center',
        marginTop: defaults.spacing,
        height: 48
    },
    buttonDisabled: {
        backgroundColor: defaults.secondary,
        padding: 15,
        borderRadius: 5,
        width: defaults.contentWidth,
        alignItems: 'center',
        marginTop: defaults.spacing,
        height: 48
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    dropdown: {
        height: 48,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        width: defaults.contentWidth,
    },
};