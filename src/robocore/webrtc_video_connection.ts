import { MediaStream, permissions, RTCPeerConnection, RTCSessionDescription } from "react-native-webrtc";
import { getUser, getVideoRobocoreConfig } from "./robocore-config";
import { SignalingConnection } from "../util/SignalingConnection";
import { Robot } from "./Robot";
import { sleep } from "../util/cf";

export interface VideoRTCFeed {
  roomId: string;
  peerConnection: RTCPeerConnection;
  mediaStream?: MediaStream;
  onTrack?: (track: any) => void;
  // track?: any;
  signalingConnection: SignalingConnection;
  gotAnswer: boolean;
  retryTimer?: any;
}

const connections = new Map<string, VideoRTCFeed>();

export async function createPeerVideoConnection(robot: Robot, onTrack: ((track: any) => void) | null = null): Promise<VideoRTCFeed> {
  const user = getUser();
  const userId = user._id;
  const signalingConnection = new SignalingConnection({
    group: `video-${userId}`,
    deviceId: robot._id,
    token: robot.token,
  });
  let baseUrl = getVideoRobocoreConfig().baseUrl;
  signalingConnection.config.baseUrl = baseUrl;
  await signalingConnection.connect();
  const device = await signalingConnection.getDevice() as any;
  console.log('VIDEO WRTC DEVICE: ', device);
  const roomId = device._id;
  const turnServer = `stun:${device.creds.turnServer},turn:${device.creds.turnServer}`;
  const turnCred = device.creds.turnCred;
  if (connections.has(roomId)) {
    const feed = connections.get(roomId)!;
    feed.peerConnection.close();
    feed.signalingConnection.close();
  }
  //   const iceServers = await loadRecord<StunTurnCredentials>(`credentials/StunTurn`);
  // console.log(iceServers);
  const configuration = {
    iceServers: [],
    iceCandidatePoolSize: 10
  };
  if (device.creds.turnServer !== 'direct') {
    const iceServers = turnServer.split(',').map((server) => server.trim());
    console.log('Using STUN/TURN servers:', iceServers);
    const [username, credential] = turnCred.split(':');
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
  } else {
    console.log('Direct mode: Adding minimal STUN fallback for NAT/emulator');
    // // Fallback: Free public STUN (works 99% for emulators; rotate if rate-limited)
    // (configuration.iceServers as any).push({
    //   urls: [
    //     'stun:stun.l.google.com:19302',
    //     'stun:stun1.l.google.com:19302' // Backup
    //   ]
    // });
  }
  const feed: VideoRTCFeed = {
    roomId,
    peerConnection: new RTCPeerConnection(configuration),
    signalingConnection,
    gotAnswer: false,
    onTrack: onTrack || undefined,
  };
  registerPeerConnectionListeners(feed);
  connections.set(roomId, feed);
  return feed;
}

export function getPeerConnection(roomId: string) {
  return connections.get(roomId);
}

export function deletePeerConnection(roomId: string) {
  if (!connections.has(roomId)) {
    return;
  }
  console.log('Deleting video peer connection for roomId:', roomId);
  const feed = connections.get(roomId)!;
  if (feed.retryTimer) {
    clearInterval(feed.retryTimer);
    feed.retryTimer = null;
  }
  feed.peerConnection.close();
  feed.signalingConnection.close();
  connections.delete(roomId);
}

export function registerPeerConnectionListeners(feed: VideoRTCFeed) {
  console.log('VIDEO WEBRTC REGISTERING LISTENERS');
  const { peerConnection, mediaStream, signalingConnection } = feed;
  // let remoteSetupComplete = false;
  const setupRemote = async (offer: any) => {
    if (feed.retryTimer) {
      clearTimeout(feed.retryTimer);
      feed.retryTimer = null;
    }
    // console.log('VIDEO WEBRTC SETUP REMOTE OFFER RECEIVED');
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    const sdpCandidateArray = offer.sdp.split('\n').filter((line: string) => line.startsWith('a=candidate'));
    console.log(sdpCandidateArray.length, 'candidates to add from offer');
    for (const candidate of sdpCandidateArray) {
      const candidateSDP = candidate.substring(2);
      await peerConnection.addIceCandidate({ candidate: candidateSDP, sdpMid: '0', sdpMLineIndex: 0 });
    }
    // console.log('VIDEO WEBRTC SENDING ANSWER');
    const timeout = 0;
    await sleep(timeout); // Wait a moment to ensure ICE candidates are gathered
    signalingConnection.sendReplace({ answer });
    console.log(`VIDEO WEBRTC ANSWER SENT after ${timeout}ms, STATE:`, peerConnection.connectionState);
  }
  signalingConnection.config.onReplace = async (replace: any) => {
    console.log('VIDEO WEBRTC ON REPLACE RECEIVED');
    if (replace.offer && !feed.gotAnswer) {
      feed.gotAnswer = true;
      console.log('VIDEO WEBRTC OFFER REPLACE');
      await setupRemote(replace.offer);
    }
  };
  signalingConnection.config.onUpdate = async (update: any) => {
    if (update.offer && !feed.gotAnswer) {
      feed.gotAnswer = true;
      console.log('VIDEO WEBRTC OFFER UPDATE in state:', feed.peerConnection.connectionState);
      // if (feed.peerConnection.connectionState === 'connected' || 
      //     feed.peerConnection.connectionState === 'connecting') {
      //   console.log('VIDEO WEBRTC OFFER UPDATE: already connected');
      //   return;
      // }
      await setupRemote(update.offer);
    }
  };
  const pca = peerConnection as any;
  // // Log SDP
  // pca.onnegotiationneeded = async () => {
  //   const offer = await peerConnection.createOffer();
  //   console.log('Local SDP Offer in event:', offer.sdp);
  //   await peerConnection.setLocalDescription(offer);
  //   // Send offer via signaling
  // };
  pca.ontrack = (event: any) => {
    console.log('Got remote track:', event.streams[0]);
    feed.mediaStream = event.streams[0];
    if (feed.onTrack) {
      feed.onTrack(event.streams[0]);
    }
  };
  pca.onicecandidate = async (event: any) => {
    if (!event.candidate) {
      console.log('Got final candidate!');
      const dataGram = { calleeCandidatesSent: true };
      signalingConnection.sendReplace(dataGram);
      return;
    }
    const candidate = event.candidate.toJSON();
    console.log('Got candidate: ', event.candidate);
    const dataGram = { calleeCandidates: [candidate] };
    signalingConnection.sendAppend(dataGram);
  };
  pca.onicegatheringstatechange = () => {
    console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
  };
  pca.oniceconnectionstatechange = () => {
    console.log(`VIDEO WEBRTC ICE CONNECTION STATE: ${peerConnection.iceConnectionState}`); // Use iceConnectionState
    const state = peerConnection.iceConnectionState;
    if (state === 'failed') {
      // console.error('ICE failed—restarting or deleting');
      // Optional: peerConnection.restartIce(); // Requires setRemoteDescription first
      // peerConnection.setRemoteDescription()
      // peerConnection.restartIce();
      deletePeerConnection(feed.roomId);
    } else if (state === 'disconnected') {
      console.log('ICE disconnected—check network');
      deletePeerConnection(feed.roomId);
    } else if (state === 'checking') {
      console.log('ICE checking—monitor candidates (~5-30s expected)');
    } else if (state === 'connected') {
      console.log('ICE connected—media should flow!');
    }
  };
  pca.onicecandidateerror = (event: any) => {
    console.error('ICE Candidate Error:', event.errorCode, event.errorText);
  };
  pca.onsignalingstatechange = () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`);
  };
  feed.retryTimer = setInterval(() => {
    signalingConnection.sendReplace({ clientReady: true });
  }, 5000);
  signalingConnection.sendReplace({ clientReady: true });
}
