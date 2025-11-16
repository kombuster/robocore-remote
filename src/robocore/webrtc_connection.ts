import { MediaStream, RTCPeerConnection, RTCSessionDescription } from "react-native-webrtc";
import { SignalingConnection } from "../util/SignalingConnection";
import RTCDataChannel from "react-native-webrtc/lib/typescript/RTCDataChannel";
import { sleep } from "../util/cf";

let alternateSignalingUrl: string | null = null;

export function setAlternateSignalingUrl(url: string) {
  alternateSignalingUrl = url;
}

export interface RTCFeed {
  connectionId: string;
  peerConnection: RTCPeerConnection;
  mediaStream: MediaStream;
  dataChannels: {
    // RTCDataChannel[];
    [key: string]: RTCDataChannel;
  };
  signalingConnection: SignalingConnection;
  onConnectionStateChanged: (state: string) => boolean;
  configuration: {
    iceServers: any[];
    iceCandidatePoolSize: number;
  };
  retryTimer?: any;
}

export interface RTCConfig {
  stunTurnServers: string;
  stunTurnCredentials: string;
}

const connections = new Map<string, RTCFeed>();

export async function createPeerConnection(
  group: string,
  deviceId: string,
  token: string,
  signalingUrl: string,
  onDataChannel: (channel: RTCDataChannel) => void) {
  try {
    const signalingConnection = new SignalingConnection({
      deviceId,
      token,
      group,
      baseUrl: signalingUrl,
    });
    // debugger;
    await signalingConnection.connect();
    const device = await signalingConnection.getDevice() as any;
    console.log({ device });
    const turnCred = device.creds.turnCred;
    const turnServer = device.creds.turnServer;
    const stunTurnServers = `stun:${turnServer},turn:${turnServer}`;
    const stunTurnCredentials = turnCred;
    // const { stunTurnServers, stunTurnCredentials } = config;
    if (connections.has(deviceId)) {
      const feed = connections.get(deviceId)!;
      feed.peerConnection.close();
      feed.signalingConnection.close();
    }
    //   const iceServers = await loadRecord<StunTurnCredentials>(`credentials/StunTurn`);
    // console.log(iceServers);
    const configuration = {
      iceServers: [],
      iceCandidatePoolSize: 10
    };
    if (turnServer !== 'direct') {
      const iceServers = stunTurnServers.split(',').map((server) => server.trim());
      const [username, credential] = stunTurnCredentials.split(':');
      for (const server of iceServers) {
        if (server.startsWith('stun:')) {
          (configuration.iceServers as any).push({
            urls: server
          });
        } else if (server.startsWith('turn:')) {
          (configuration.iceServers as any).push({
            urls: server,
            username,
            credential
          });
        }
      }
    }
    console.log({ configuration });
    const feed: RTCFeed = {
      connectionId: deviceId,
      peerConnection: new RTCPeerConnection(configuration),
      mediaStream: new MediaStream(),
      signalingConnection,
      dataChannels: {},
      configuration,
      onConnectionStateChanged: (state: string) => false
    };
    registerPeerConnectionListeners(feed, onDataChannel);
    connections.set(deviceId, feed);
    return feed;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function getPeerConnection(roomId: string) {
  return connections.get(roomId);
}

export function deletePeerConnection(roomId: string) {
  if (!connections.has(roomId)) {
    return;
  }
  const feed = connections.get(roomId)!;
  if (feed.retryTimer) {
    clearInterval(feed.retryTimer);
    feed.retryTimer = null;
  }
  if (feed.peerConnection.signalingState !== 'closed') {
    feed.peerConnection.close();
  }
  feed.signalingConnection.close();
  connections.delete(roomId);
}

export function registerPeerConnectionListeners(feed: RTCFeed, onDataChannel: (channel: RTCDataChannel) => void) {
  const { peerConnection, mediaStream, signalingConnection } = feed;
  const setupRemote = async (offer: any) => {
    try {
      if (feed.retryTimer) {
        clearInterval(feed.retryTimer);
        feed.retryTimer = null;
      }
      signalingConnection.sendDelete({ offer: true });      
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      const sdpCandidateArray = offer.sdp.split('\n').filter((line: string) => line.startsWith('a=candidate'));
      for (const candidate of sdpCandidateArray) {
        const candidateSDP = candidate.substring(2);
        await peerConnection.addIceCandidate({ candidate: candidateSDP, sdpMid: '0', sdpMLineIndex: 0 });
      }
      await sleep(100); // Wait a moment to ensure ICE candidates are gathered
      signalingConnection.sendReplace({ answer });
    } catch (e) {
      console.error('Error setting up remote description:', e);
    }
  }
  signalingConnection.config.onReplace = async (message: any) => {
    console.log('Got replace:', message);
    if (message.offer) {
      await setupRemote(message.offer);
    }
  }
  signalingConnection.config.onUpdate = async (message: any) => {
    console.log('Got update:', message);
    if (message.offer) {
      await setupRemote(message.offer);
    }
  }
  // webSocket.addEventListener('message', async event => {
  //   const message = JSON.parse(event.data);
  //   // console.log({ message });
  //   if (message.replace && message.replace.offer) {
  //     // console.log('Got offer replace:', message.replace.offer);
  //     await setupRemote(message.replace.offer);
  //   } else if (message.update && message.update.offer) {
  //     // console.log('Got offer update :', message.update.offer);
  //     await setupRemote(message.update.offer);
  //   }
  // });
  const pca = peerConnection as any;
  pca.addEventListener('datachannel', (event: any) => {
    // console.log('Got data channel:', event.channel.label);
    feed.dataChannels[event.channel.label] = (event.channel);
    onDataChannel(event.channel);
    // event.channel;
  });
  pca.addEventListener('track', (event: any) => {
    // console.log('Got remote track:', event.streams[0]);
    event.streams[0].getTracks().forEach((track: any) => {
      // console.log('Add a track to the remoteStream:', track);
      mediaStream.addTrack(track);
    });
  });
  pca.addEventListener('icecandidate', async (event: any) => {
    if (!event.candidate) {
      // console.log('Got final candidate!');
      signalingConnection.sendReplace({ calleeCandidatesSent: true });
      return;
    }
    const candidate = event.candidate.toJSON();
    signalingConnection.sendAppend({ calleeCandidates: [candidate] });
  });
  pca.addEventListener('icegatheringstatechange', () => {
    // console.log(`ICE gathering state changed: ${pca.iceGatheringState}`);
  });
  pca.addEventListener('connectionstatechange', async () => {
    feed.onConnectionStateChanged(pca.connectionState);
    if (pca.connectionState === 'disconnected' || pca.connectionState === 'failed') {
      deletePeerConnection(feed.connectionId);
    }
  });
  pca.addEventListener('onicecandidateerror', (event: any) => {
    // console.error('ICE Candidate Error:', event.errorCode, event.errorText);
  });
  pca.addEventListener('signalingstatechange', () => {
    // console.log(`Signaling state change: ${pca.signalingState}`);
  });
  pca.addEventListener('iceconnectionstatechange ', () => {
    // console.log(`ICE connection state change: ${pca.iceConnectionState}`);
  });
  feed.retryTimer = setInterval(() => {
    signalingConnection.sendReplace({ clientReady: true });
  }, 5000);
  signalingConnection.sendReplace({ clientReady: true });
}
