import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StatusBar, StyleSheet, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Navigation from 'src/navigation/navigation';
import {persistor, store} from './src/redux/store';
import SplashScreen from './src/screens/SplashScreen/SplashScreen';
import {createConfig, GluestackUIProvider} from '@gluestack-ui/themed';
import {darkTheme, lightTheme} from './src/theme/colors';
import {config} from '@gluestack-ui/config';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<SplashScreen />}
        persistor={persistor}
        onBeforeLift={() => new Promise(resolve => setTimeout(resolve, 3000))}>
        <ThemeApp />
      </PersistGate>
    </Provider>
  );
};

const ThemeApp = () => {
  const colorScheme = useColorScheme();
  const theme = createConfig({
    ...config,
    tokens: {
      ...config.tokens,
      colors: {
        ...config.tokens.colors,
        ...(colorScheme === 'dark' ? darkTheme.colors : lightTheme.colors),
      },
      // shadow,
      // ...typography,
      // opacity,
    },
  });

  const linking = {
    prefixes: ['videocalling://'],
    config: {
      screens: {
        homeScreen: {
          path: `homescreen/:token/:meetingId`,
        },
      },
    },
  };
  return (
    // <NativeBaseProvider theme={theme}>
    // <SafeAreaProvider
    //   initialMetrics={{
    //     frame: {x: 0, y: 0, width: 0, height: 0},
    //     insets: {top: 0, left: 0, right: 0, bottom: 0},
    //   }}>
    <GluestackUIProvider config={theme}>
      <SafeAreaProvider
        initialMetrics={{
          frame: {x: 0, y: 0, width: 0, height: 0},
          insets: {top: 0, left: 0, right: 0, bottom: 0},
        }}>
        <StatusBar
          animated={true}
          backgroundColor={
            colorScheme === 'dark'
              ? darkTheme.colors.basePrimary
              : lightTheme.colors.basePrimary
          }
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <NavigationContainer linking={linking}>
          {/* <ToastProvider> */}
          <Navigation />
          {/* </ToastProvider> */}
        </NavigationContainer>
        {/* </SafeAreaProvider> */}
        {/* </NativeBaseProvider> */}
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
