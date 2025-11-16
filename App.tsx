/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { startHidMonitoring, stopHidMonitoring } from './src/hid/monitor';
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import { HidView } from './src/hid/HidView';
import { Dashboard } from './src/dash/Dashboard';
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(10, 132, 255)',
  },
};
function App() {
  // const isDarkMode = true; // useColorScheme() === 'dark';

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        {/* <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} /> */}
        <AppContent />
      </SafeAreaProvider>
    </PaperProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  useEffect(() => {
    // startHidMonitoring();
    // return () => {
    //   stopHidMonitoring();
    // };
    console.log("AppContent mounted");
  }, []);
  return (
    <View style={{
      flex: 1,
      marginTop: safeAreaInsets.top,
      marginBottom: safeAreaInsets.bottom,
    }}>
      <Dashboard />
    </View>
  );
}

export default App;
