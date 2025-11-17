import React from 'react';
import { View, StyleSheet } from "react-native";
import { RobotAgent } from "../robocore/RobotAgent";
import { VideoFeed } from './VideoFeed';
import { MapView } from './MapView';
export function LiveView({ agent }: { agent: RobotAgent }) {
  const [videoStyle, setVideoStyle] = React.useState(windowStyles.t3);
  const [mapStyle, setMapStyle] = React.useState(windowStyles.inset);
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

const windowStyles = StyleSheet.create({
  inset: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: '40%',
    height: '40%',
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'white',
    
  },
  t0: {
    width: '100%',
    justifyContent: 'flex-start',
    height: 50,
  },
  t1: {
    width: '100%',
    justifyContent: 'flex-start',
    height: 100,
  },
  t2: {
    width: '100%',
    justifyContent: 'flex-start',
    height: 200,
  },
  t3: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    height: 300,
  },
});
