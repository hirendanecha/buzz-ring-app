import {
  FlatList,
  Image,
  Linking,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import style from "./HomeScreen.styles";
import { useDispatch, useSelector } from "react-redux";
import { useCameraPermission } from "react-native-vision-camera";
import {
  AddIcon,
  Heading,
  Icon,
  Modal,
  ModalBackdrop,
  ModalHeader,
  useStyled,
} from "@gluestack-ui/themed";
import { useToastMessage } from "../../hooks/useToastMessage";
import AppLoader from "../../components/AppLoader";
import { ModalContent } from "@gluestack-ui/themed";
import { ModalBody } from "@gluestack-ui/themed";
import { ModalFooter } from "@gluestack-ui/themed";
import { Button } from "@gluestack-ui/themed";
import { ButtonText } from "@gluestack-ui/themed";
import GlobalString from "../../constants/string";
import { SvgXml } from "react-native-svg";
import { removeUser } from "../../redux/store/scanner/scannerSlice";
import { PermissionsAndroid } from "react-native";
import messaging from "@react-native-firebase/messaging";
import DeviceInfo from "react-native-device-info";
import { registerDeviceThunk } from "../../redux/store/auth/authAction";
import { Platform } from "react-native";
import { requestNotifications } from "react-native-permissions";
import { deleteUserThunk } from "../../redux/store/scanner/scannerAction";
import { scale } from "../../constants/matrics";
import { useColorScheme } from "react-native";

const HomeScreen = ({ navigation }) => {
  const styled = useStyled();
  const styles = style(styled.config.tokens);
  const scanner = useSelector((state) => state?.scanner?.data1) || [];
  const { loading } = useSelector((state) => state.scanner);
  const { hasPermission, requestPermission } = useCameraPermission();
  const { showToast } = useToastMessage();
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [isShowDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  const dispatch = useDispatch();
  const colorScheme = useColorScheme();

  useEffect(() => {
    try {
      const hasNotificationPermission = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (!hasNotificationPermission) {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        showToast({
          message: "Please give notification permission to receive call.",
        });
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    try {
      async function requestPermissions() {
        if (Platform.OS === "android") {
          await requestNotifications(["alert", "sound"]);
        }
      }
      requestPermissions();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const checkTokenAndRegisterDevice = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        const deviceId = DeviceInfo.getDeviceId();
        console.log(fcmToken, "fcmToken", deviceId);

        if (deviceId) {
          const data = await dispatch(
            registerDeviceThunk({
              fcmToken: fcmToken,
              deviceId: deviceId,
            })
          ).unwrap();

          console.log(data, "Device register data");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteScannedUser = async (item) => {
    try {
      setShowDeleteModal(false);
      setDeleteUser(null);
      const payload = {
        scanId: item.scanId,
      };
      const data = await dispatch(deleteUserThunk(payload)).unwrap();
      console.log(data, "deleted user");
      dispatch(removeUser(item.Id));
      showToast({ message: "User deleted successfully !!" });
    } catch (error) {
      console.log(error);
      showToast({ message: error?.message });
    }
  };

  useEffect(() => {
    checkTokenAndRegisterDevice();
  }, []);

  useEffect(() => {
    requestPermission();
  }, []);

  const navigateToScannerScreen = () => {
    navigation.navigate("ScannerScreen");
  };

  const checkCameraPermission = async () => {
    if (hasPermission) {
      navigateToScannerScreen();
    } else {
      const permission = await requestPermission();
      if (permission) {
        navigateToScannerScreen();
      } else {
        setIsOpenSettingModal(true);
      }
    }
  };

  const OpenSettingModal = () => {
    return (
      <Modal
        isOpen={isOpenSettingModal}
        alignItems={"center"}
        justifyContent={"center"}
        onClose={() => {
          setIsOpenSettingModal(false);
        }}
      >
        <ModalBackdrop />
        <ModalContent width={"90%"} height={"auto"}>
          <ModalHeader width={"100%"}>
            <Heading size="sm">{GlobalString.ENABLE_CAMERA_PERMISSION}</Heading>
          </ModalHeader>
          <ModalBody>
            <Text style={{ color: "black" }}>
              {GlobalString.ENABLE_CAMERA_PERMISSION_SETTING}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              borderWidth="$0"
              onPress={() => {
                setIsOpenSettingModal(false);
              }}
            >
              <ButtonText>{GlobalString.CANCEL}</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="outline"
              action="secondary"
              borderWidth="$0"
              onPress={() => {
                Linking.openSettings();
              }}
            >
              <ButtonText>{GlobalString.GO_TO_SETTINGS}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const ShowDeleteModal = () => {
    return (
      <Modal
        isOpen={isShowDeleteModal}
        alignItems={"center"}
        justifyContent={"center"}
        onClose={() => {
          setShowDeleteModal(false);
        }}
      >
        <ModalBackdrop />
        <ModalContent width={"90%"} height={"auto"}>
          <ModalHeader width={"100%"}>
            <Heading size="sm">{GlobalString.DELETE_USER}</Heading>
          </ModalHeader>
          <ModalBody>
            <Text style={{ color: "black" }}>
              {GlobalString.DELETE_USER_DESC}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              borderWidth="$0"
              onPress={() => {
                setShowDeleteModal(false);
              }}
            >
              <ButtonText>{GlobalString.CANCEL}</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="outline"
              action="secondary"
              borderWidth="$0"
              onPress={() => {
                deleteScannedUser(deleteUser);
              }}
            >
              <ButtonText>{GlobalString.DELETE}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <>
      <AppLoader showModal={loading} />
      <OpenSettingModal />
      <ShowDeleteModal isShow={isShowDeleteModal} />
      <View style={styles.mainContainer}>
        <StatusBar barStyle={"light-content"} />
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Buzz Ring</Text>
          {scanner.length > 0 && (
            <TouchableOpacity
              style={{ alignSelf: "center" }}
              onPress={() => {
                checkCameraPermission();
              }}
            >
              <Icon as={AddIcon} style={styles.plusIcon} />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={scanner}
          style={{
            flex: 1,
          }}
          numColumns={2}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyExtractor={(item) => item?.Id?.toString()}
          ListEmptyComponent={() => (
            <View style={styles.noDataContainer}>
              <TouchableOpacity
                style={{
                  alignSelf: "center",
                  borderColor: "#212f48",
                  borderWidth: 0,
                  borderRadius: scale(100),
                  width: scale(50),
                  height: scale(50),
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  checkCameraPermission();
                }}
              >
                <Icon
                  as={AddIcon}
                  style={{
                    color: colorScheme === "dark" ? "white" : "#212f48",
                    width: scale(50),
                    height: scale(50),
                  }}
                />
              </TouchableOpacity>
              <Text style={styles.noDataText}>
                {GlobalString.SCAN_YOUR_TEXT}
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.scannedDataContainer}>
              <Image
                source={{ uri: item.ProfilePicName }}
                style={styles.scannedImage}
              />
              <TouchableOpacity
                onPress={() => {
                  setDeleteUser(item);
                  setShowDeleteModal(true);
                  console.log(item.Id);
                }}
                style={styles.deleteIcon}
              >
                <SvgXml
                  xml={`
              <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 20 20" width="15px" fill="red" height="15px"><path d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"/></svg>`}
                />
              </TouchableOpacity>
              <Text style={styles.scannedText}>{item?.Username}</Text>
              <Text style={styles.scannedText}>{item?.domain}</Text>
            </View>
          )}
        />
        {scanner.length > 0 && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              {GlobalString.YOUR_BUZZRING_APP_IS_NOW_ACTIVE}
            </Text>
            <Text style={styles.successText}>
              {GlobalString.YOUR_PHONE_WILL_RING_WHEN_SOMEONE_CALLS_YOU}
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

export default HomeScreen;
