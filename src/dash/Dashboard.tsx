import { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import { Button, DataTable, IconButton, MD3Colors, Menu, Divider } from "react-native-paper";
import { StyleSheet } from "react-native";
import { RobotAgent, RobotConnectionState } from "../robocore/RobotAgent";
import { VideoFeed } from "./VideoFeed";
import { HidView } from "../hid/HidView";
import { startHidMonitoring, stopHidMonitoring } from "../hid/monitor";
import { loadInputSettings } from "../hid/HidInputs";
import { LiveView } from "./LiveView";

export enum DashboardScreen {
  MAIN = 'main',
  INPUT = 'input',
}

export function Dashboard() {
  const [robotAgent, setRobotAgent] = useState(new RobotAgent());
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isConnected, setIsConnected] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<DashboardScreen>(DashboardScreen.MAIN);
  useEffect(() => {
    loadInputSettings().then(() => {
      startHidMonitoring();
    }).catch((err) => {
      console.error('Error loading HID input settings:', err);
    });
    return () => {
      stopHidMonitoring();
      if (robotAgent.connectionState === RobotConnectionState.Connected) {
        robotAgent.disconnect();
      }
    }
  }, []);
  const styles = StyleSheet.create({
    menuButton: {
      width: '100%',
      justifyContent: 'flex-start',
      height: 50,
    },
    menuButtonText: {
      fontSize: 24,
      color: 'white',
      textAlign: 'left',  // Left-aligns the text
      flex: 1,  // Allows text to take full available space      
    },
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'transparent',
    }
  });

  const connect = async () => {
    // Connection logic here
    await robotAgent.connect();
  };
  const disconnect = async () => {
    // Disconnection logic here
    await robotAgent.disconnect();
  };
  const switchCamera = () => {
    if (robotAgent.availableCameras.length === 0) {
      console.log('No available cameras to switch.');
      return;
    }
    const currentIndex = robotAgent.availableCameras.indexOf(robotAgent.selectedCamera);
    const nextIndex = (currentIndex + 1) % robotAgent.availableCameras.length;
    const nextCamera = robotAgent.availableCameras[nextIndex];
    robotAgent.controlChannel.sendRequest({ selectedCamera: nextCamera });
    console.log('Switching to camera:', nextCamera);
  }
  const menuWidth = 200;
  const switchScreen = (screen: DashboardScreen) => {
    // Logic to switch screens
    setMenuVisible(false);
    setCurrentScreen(screen);
    // console.log('Switching to screen:', screen);
  }
  return (
    <>
      <View style={{
        position: 'absolute',
        backgroundColor: 'transparent',
        flexDirection: 'row',  // Key: Arranges children horizontally
        justifyContent: 'flex-end',  // Distributes buttons evenly
        alignItems: 'center',
        width: '100%',
        top: 0,
        left: 0,
        height: 68,
        paddingRight: 16,
        paddingTop: 8,
        zIndex: 1000,
      }}>
        <IconButton
          iconColor={isConnected ? MD3Colors.secondary100 : MD3Colors.error30}
          icon={isConnected ? "access-point-check" : "access-point-off"}
          size={50}
        />
        <IconButton
          iconColor={MD3Colors.secondary100}
          onPress={() => setMenuVisible(!menuVisible)}
          icon={menuVisible ? "account-arrow-up-outline" : "account-arrow-down-outline"}
          size={50}
        />
      </View>
      {menuVisible && (
        <View style={{
          position: 'absolute',
          backgroundColor: 'rgba(50,50,50,0.5)',
          flexDirection: 'column',  // Key: Arranges children horizontally
          justifyContent: 'flex-start',  // Distributes buttons evenly
          alignItems: 'flex-start',
          width: menuWidth,
          bottom: 0,
          left: (screenData.width - menuWidth) / 2,
          top: 80,
          height: 210,
          padding: 8,
          zIndex: 1000,
        }}>
          <Button
            labelStyle={styles.menuButtonText} uppercase style={styles.menuButton}
            icon={'wifi-sync'} onPress={() => switchScreen(DashboardScreen.MAIN)}>
            Connect
          </Button>
          <Button
            labelStyle={styles.menuButtonText} uppercase style={styles.menuButton}
            icon={'keyboard-outline'} onPress={() => switchScreen(DashboardScreen.INPUT)}>
            Controls
          </Button>
        </View>)}
      {currentScreen === DashboardScreen.MAIN && (
        <View style={styles.container}>
          <LiveView agent={robotAgent} />
        </View>
      )}
      {currentScreen === DashboardScreen.INPUT && (
        <View style={styles.container}>
          <HidView />
        </View>
      )}
    </>
  );
}