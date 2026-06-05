import { Text, ActivityIndicator, Platform, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Utils from '../utils/display';
import { colors, defaults } from '../utils/styles';

// props:
// action: what to do when pressed
// color: background color - if omitted, defaults to primary color
// disabled: true or false
// disabledColor: background color to use when disabled
// style: additional styles - otherwise basic button styling is applied
// icon: if specified, icon to show from FontAwesome - e.g. faPlus
// text: if specified, label to show
// refreshing: true or false - if refreshing is true, shows an ActivityIndicator instead of the icon

export default function Button(props) {
    const disabledBg = props?.disabledColor || colors.secondary;
    const textColor = props?.disabled
        ? Utils.isColorDark(disabledBg) ? 'white' : 'black'
        : Utils.isColorDark(props?.color || colors.primary) ? 'white' : 'black';

    const styles = {
        button: {
            backgroundColor: props?.disabled ? disabledBg : props?.color || colors.primary,
            flexDirection: 'row',
            borderRadius: 100,
            paddingVertical: 12,
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            height: 46 // Adjust height if changing font size
        },
        text: {
            color: textColor,
            fontFamily: defaults.fontFamily,
            fontSize: 16,
        }
    };

    return (
        <Pressable style={[styles.button, props?.style]} onPress={() => props.action()} disabled={props?.disabled} >
            {props?.refreshing && <ActivityIndicator size={Platform.OS == 'android' ? 18 : "small"} color={textColor} />}
            {props?.icon && !props?.refreshing && <FontAwesomeIcon icon={props.icon} color={textColor} size={16} />}
            {props?.image}
            {props?.text && <Text style={[styles.text, props?.textStyle]}>{props.text}</Text>}
        </Pressable>
    );
}

