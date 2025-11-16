import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { RTCPeerConnection, RTCView } from "react-native-webrtc";
import { AgentEvents, RobotAgent, RobotConnectionState } from "../robocore/RobotAgent";
import { createPeerVideoConnection, deletePeerConnection } from "../robocore/webrtc_video_connection";
import { getRobot } from "../robocore/robocore-config";

export function VideoFeed({ agent }: { agent: RobotAgent }) {
  const [remoteStream, setRemoteStream] = useState<any>(null);
  useEffect(() => {
    if (!agent) return;
    const handleStateChange = async (dgram: Partial<RobotAgent>) => {
      if (dgram.connectionState === RobotConnectionState.Connected) {
        // setTimeout(async () => {
        const feed = await createPeerVideoConnection(getRobot(), s => {
          console.log('Setting remote stream in VideoFeed component.');
          console.log({ s });
          setRemoteStream(s);
        });
        // setRemoteStream(feed.mediaStream);
        // console.log({ s: feed.mediaStream });
        // }, 2000);
      } else if (dgram.connectionState === RobotConnectionState.Disconnected) {
        setRemoteStream(null);
        deletePeerConnection(getRobot()._id);
      }
    };
    agent.on(AgentEvents.StateChange, handleStateChange);
    // Cleanup on unmount
    return () => {
      agent.off(AgentEvents.StateChange, handleStateChange);
    };
  }, [agent]);
  return (
    <View style={styles.container}>
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  localVideo: { width: 100, height: 150, position: 'absolute', top: 50, right: 10 },
  remoteVideo: { flex: 1 },
});
