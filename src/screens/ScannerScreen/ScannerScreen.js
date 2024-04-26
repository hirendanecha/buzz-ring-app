import {Alert, StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useStyled} from '@gluestack-style/react';
import style from './ScannerScreen.styles';
import {useDispatch, useSelector} from 'react-redux';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {
  ArrowLeftIcon,
  Button,
  ButtonText,
  Heading,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@gluestack-ui/themed';
import {scale} from '../../constants/matrics';
import {CloseIcon} from '@gluestack-ui/themed';
import {addScannerData} from '../../redux/store/scanner/scannerSlice';
import {useToastMessage} from '../../hooks/useToastMessage';
import GlobalString from '../../constants/string';
import AppLoader from '../../components/AppLoader';
import {validateTokenThunk} from '../../redux/store/scanner/scannerAction';
import {CameraScreen} from 'react-native-camera-kit';
import DeviceInfo from 'react-native-device-info';

export default function ScannerScreen({navigation}) {
  const styled = useStyled();
  const styles = style(styled.config.tokens);
  const scanner = useSelector(state => state.scanner.data);
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef(null);
  const [isActive, setIsActive] = useState(true);
  const [scanData, setScanData] = useState(null);
  const [showScanData, setShowScanData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const {showToast} = useToastMessage();

  const handleValidateToken = async data => {
    try {
      setIsLoading(true);
      // Extract the domain
      const domainRegex =
        /(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g;
      const domainMatch = data?.match(domainRegex);
      const domain = domainMatch ? domainMatch[0] : null;

      // Remove ".dev" from the domain
      const cleanedDomain = domain
        ? domain.replace('https://', '').replace('dev.', '')
        : null;

      const token = data?.split('?token=')[1];

      console.log(cleanedDomain);
      console.log(token);

      if (!cleanedDomain || !token) {
        showToast({message: 'Invalid QR code'});

        setIsLoading(false);
        resetData();
        navigation.pop();
        return;
      }

      const payload = {
        domain: cleanedDomain,
        token,
        deviceId: DeviceInfo.getDeviceId(),
      };

      const response = await dispatch(validateTokenThunk(payload)).unwrap();

      console.log('response.payload', response);

      if (response.success) {
        const isExist = scanner?.find(item => item.Id === response.data.Id);
        if (!isExist) {
          dispatch(addScannerData(response.data));
          navigation.pop();
        } else {
          showToast({message: 'User is already added !!'});
          resetData();
          navigation.pop();
        }
      } else {
        showToast({message: response.message});
        resetData();
        navigation.pop();
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      if (error?.message) {
        showToast({message: error?.message});
      }
      showToast({message: error});
      setIsLoading(false);
      resetData();
      navigation.pop();
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      try {
        setIsActive(false);
        console.log(
          `Scanned ${JSON.stringify(codes[0].value)} codes!, ${isActive}`,
        );
        if (!isActive && codes?.[0]?.value !== scanData && codes?.[0]?.value) {
          if (codes?.[0]?.value) {
            setScanData(codes?.[0]?.value);
            // addScanData(codes?.[0]?.value);
            handleValidateToken(codes?.[0]?.value);
          } else {
            // showToast({
            //   message: 'No data found !!',
            // });
            setIsActive(true);
            console.log(codes?.[0]?.value);
          }
        } else {
        }
      } catch (error) {
        console.log(error);
        resetData();
      }
    },
  });

  function resetData() {
    setScanData(null);
    setIsActive(true);
    setShowScanData(false);
  }

  const addScanData = data => {
    try {
      if (data === null) {
        showToast({
          message: 'No data found !!',
        });
        resetData();
        return;
      }
      dispatch(addScannerData(data));
      showToast({
        message: 'Data scanned successfully !!',
      });
      navigation.pop();
    } catch (error) {
      console.log(error);
      resetData();
      navigation.pop();
      showToast({
        message: error?.message,
        action: 'error',
      });
    }
  };

  const ShowScanDataModal = () => {
    return (
      <Modal
        isOpen={showScanData}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        alignSelf="center"
        borderRadius={scale(12)}
        backgroundColor="white"
        onClose={() => {
          setShowScanData(false);
        }}>
        <ModalBackdrop onPress={() => {}} />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Your scan data</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>{scanData}</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              mr="$3"
              onPress={() => {
                resetData();
              }}>
              <ButtonText>Scan Again</ButtonText>
            </Button>
            <Button
              size="sm"
              action="secondary"
              borderWidth="$0"
              onPress={() => {
                addScanData();
              }}>
              <ButtonText>Add to list</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <>
      <AppLoader showModal={isLoading} />
      <ShowScanDataModal />
      {hasPermission && (
        <View style={styles.scannerContainer}>
          <StatusBar barStyle={'light-content'} />
          <View style={styles.headerContainer}>
            <Icon
              as={ArrowLeftIcon}
              color={'white'}
              onPress={() => {
                navigation.pop();
              }}
              style={styles.backIcon}
            />
            <Text style={styles.headerText}>{GlobalString.SCAN_QR_CODE}</Text>
          </View>

          <View style={styles.cameraContainer}>
            {device ? (
              <Camera
                codeScanner={codeScanner}
                device={device}
                ref={camera}
                enableZoomGesture={true}
                style={StyleSheet.absoluteFill}
                focusable={true}
                isActive={isActive}
              />
            ) : (
              // <CameraScreen
              //   // Barcode props
              //   scanBarcode={isActive}
              //   onReadCode={event => {
              //     // try {
              //     //   setIsActive(false);
              //     //   console.log(
              //     //     `Scanned ${JSON.stringify(
              //     //       codes[0].value,
              //     //     )} codes!, ${isActive}`,
              //     //   );
              //     //   if (
              //     //     !isActive &&
              //     //     codes?.[0]?.value !== scanData &&
              //     //     codes?.[0]?.value
              //     //   ) {
              //     //     if (codes?.[0]?.value) {
              //     //       setScanData(codes?.[0]?.value);
              //     //       // addScanData(codes?.[0]?.value);
              //     //       handleValidateToken(codes?.[0]?.value);
              //     //     } else {
              //     //       // showToast({
              //     //       //   message: 'No data found !!',
              //     //       // });
              //     //       setIsActive(true);
              //     //       console.log(codes?.[0]?.value);
              //     //     }
              //     //   } else {
              //     //   }
              //     // } catch (error) {
              //     //   console.log(error);
              //     //   resetData();
              //     // }
              //     console.log(event);
              //   }} // optional
              //   showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner,that stoped when find any code. Frame always at center of the screen
              //   laserColor="red" // (default red) optional, color of laser in scanner frame
              //   frameColor="white" // (default white) optional, color of border of scanner frame
              // />
              // <CameraScreen
              //   // Barcode props
              //   scanBarcode={isActive}
              //   onReadCode={event => console.log(event?.data)} // optional
              //   showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner,that stoped when find any code. Frame always at center of the screen
              //   laserColor="red" // (default red) optional, color of laser in scanner frame
              //   frameColor="white" // (default white) optional, color of border of scanner frame
              // />
              <Text style={styles.noCameraText}>{GlobalString.NO_CAMERA}</Text>
            )}
          </View>
        </View>
      )}
    </>
  );
}
