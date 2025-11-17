import React from 'react';
import { View, StyleSheet } from "react-native";
import { RobotAgent } from "../robocore/RobotAgent";
import { VideoFeed } from './VideoFeed';
import { MapView } from './MapView';

export function LiveView({ agent, viewModeIndex }: { agent: RobotAgent, viewModeIndex: number }) {
  const [videoStyle, setVideoStyle] = React.useState(windowStyles[viewModeIndex].video);
  const [mapStyle, setMapStyle] = React.useState(windowStyles[viewModeIndex].map);
  React.useEffect(() => {
    setVideoStyle(windowStyles[viewModeIndex].video);
    setMapStyle(windowStyles[viewModeIndex].map);
  }, [viewModeIndex]);
  return (
    <>
      <View style={videoStyle}>
        <VideoFeed agent={agent} />
      </View>
      <View style={mapStyle}>
        <MapView />
      </View>

    </>
  );
}

const windowStyles = [
  StyleSheet.create({
    map: {
      position: 'absolute',
      right: 10,
      bottom: 10,
      width: '40%',
      height: '40%',
      zIndex: 1000,
      borderWidth: 1,
      borderColor: 'white',

    },
    video: {
      flex: 1,
      width: '100%',
      justifyContent: 'flex-start',
      height: 300,
    },
  }),
  StyleSheet.create({
    video: {
      position: 'absolute',
      right: 10,
      bottom: 10,
      width: '40%',
      height: '40%',
      zIndex: 1000,
      borderWidth: 1,
      borderColor: 'white',

    },
    map: {
      flex: 1,
      width: '100%',
      justifyContent: 'flex-start',
      height: 300,
    },
  })
];
