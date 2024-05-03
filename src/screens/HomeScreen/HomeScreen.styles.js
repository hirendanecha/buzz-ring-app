import { Platform, StyleSheet, useColorScheme } from "react-native";
import { darkTheme, lightTheme } from "../../theme/colors";
import textStyles from "../../constants/textTheme";
import { scale, verticalScale } from "../../constants/matrics";

const style = (theme) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme?.colors?.backgroundColor,
      paddingBottom: 20,
    },
    headerContainer: {
      backgroundColor: "#212f48",
      width: "100%",
      justifyContent: "center",
      paddingHorizontal: "5%",
      paddingTop: Platform.OS === "ios" ? 40 : 0,
      paddingBottom: Platform.OS === "ios" ? 20 : 10,
      flexDirection: "row",
    },
    headerText: {
      ...textStyles.headlineSmall,
      color: "white",
      marginTop: 10,
      flex: 1,
    },
    plusIcon: {
      color: "white",
      width: scale(20),
      height: scale(20),
      marginTop: 10,
    },
    noData: {
      ...textStyles.bodyMedium,
      color: "black",
      alignSelf: "center",
    },
    cameraContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    scannedDataContainer: {
      flex: 1,
      backgroundColor: theme?.colors?.cardColor,
      padding: scale(15),
      margin: scale(10),
      borderRadius: scale(10),
      alignItems: "center",
      justifyContent: "center",
      gap: scale(10),
    },
    scannedData: {
      ...textStyles.bodyMedium,
      color: "white",
    },
    noDataContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    noDataText: {
      ...textStyles.bodySmall,
      color: theme.colors.textColor,
      marginTop: verticalScale(10),
      textAlign: "center",
      width: "90%",
    },
    scannedImage: {
      width: 50,
      height: 50,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: theme.colors.basePrimary,
      resizeMode: "cover",
    },
    scannedText: {
      ...textStyles.bodyMedium,
      color: theme.colors.textColor,
    },
    deleteIcon: {
      position: "absolute",
      top: 8,
      right: 8,
    },
    successText: {
      ...textStyles.bodySmall,
      color: theme.colors.textColor,
      textAlign: "center",
      marginTop: verticalScale(4),
    },
    successContainer: {
      flex: 1,
      width: "90%",
      alignSelf: "center",
    },
  });
};
export default style;
