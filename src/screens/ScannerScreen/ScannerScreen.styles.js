import {Platform, StyleSheet, useColorScheme} from 'react-native';
import {darkTheme, lightTheme} from '../../theme/colors';
import textStyles from '../../constants/textTheme';
import {scale, verticalScale} from '../../constants/matrics';

const style = theme => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return StyleSheet.create({
    scannerContainer: {
      flex: 1,
    },
    headerContainer: {
      backgroundColor: '#212f48',
      width: '100%',
      paddingHorizontal: '5%',
      paddingTop: Platform.OS === 'ios' ? 40 : 0,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(20),
    },
    headerText: {
      ...textStyles.headlineSmall,
      color: 'white',
      marginTop: 10,
    },
    noCameraText: {
      ...textStyles.bodyLarge,
      color: theme.colors.basePrimary,
    },
    backIcon: {
      color: 'white',
      width: scale(20),
      height: scale(20),
      marginTop: 10,
    },
    cameraContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
  });
};
export default style;
