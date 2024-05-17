import React, {useEffect, useRef, useState} from 'react';
import {Text, View, StyleSheet, StatusBar} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import DeviceInfo from 'react-native-device-info';
import {useDispatch, useSelector} from 'react-redux';
import {addScannerData} from '../../redux/store/scanner/scannerSlice';
import {validateTokenThunk} from '../../redux/store/scanner/scannerAction';
import {useToastMessage} from '../../hooks/useToastMessage';
import GlobalString from '../../constants/string';
import style from './ScannerScreen.styles';
import AppLoader from '../../components/AppLoader';
import {ArrowLeftIcon, Icon, useStyled} from '@gluestack-ui/themed';

export default function ScannerScreen({navigation}) {
  const scanner = useSelector(state => state?.scanner?.data) || [];
  const {hasPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const [isActive, setIsActive] = useState(true);
  const [scanData, setScanData] = useState(null);
  const dispatch = useDispatch();
  const {showToast} = useToastMessage();
  const styled = useStyled();
  const styles = style(styled.config.tokens);
  const [isLoading, setIsLoading] = useState(false);
  const camera = useRef(null);

  const resetData = () => {
    setScanData(null);
    setIsActive(true);
  };

  const gotoHome = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleValidateToken = async data => {
    try {
      setIsLoading(true);
      // Extract the domain and token
      const domainRegex =
        /(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g;
      const domainMatch = data?.match(domainRegex);
      const domain = domainMatch ? domainMatch[0] : null;
      const token = data?.split('?token=')[1];

      if (!domain || !token) {
        showToast({message: 'Invalid QR code'});
        setIsLoading(false);
        resetData();
        gotoHome();
        return;
      }

      const cleanedDomain = domain.replace('https://', '').replace('dev.', '');
      const payload = {
        domain: cleanedDomain,
        token,
        deviceId: DeviceInfo.getDeviceId(),
      };

      const response = await dispatch(validateTokenThunk(payload)).unwrap();

      setIsLoading(false);
      if (response.success) {
        const isExist = scanner.find(item => item.Id === response.data.Id);
        if (!isExist) {
          await dispatch(addScannerData(response.data));
          gotoHome();
        } else {
          resetData();
          gotoHome();
          showToast({message: 'User is already added !!'});
        }
      } else {
        resetData();
        gotoHome();
        showToast({message: response.message});
      }
    } catch (error) {
      showToast({message: error?.message || error.toString()});
      console.log(error);
      setIsLoading(false);
      resetData();
      gotoHome();
    }
  };

  useEffect(() => {
    if (!isActive && scanData && !isLoading) {
      handleValidateToken(scanData);
    } else {
      setIsActive(true);
    }
  }, [isActive, scanData]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      setIsActive(false);
      setScanData(codes?.[0]?.value);
    },
  });

  return (
    <>
      <AppLoader showModal={isLoading} />
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
