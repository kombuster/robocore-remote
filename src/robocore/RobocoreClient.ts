import { SyncConnection } from "../sync/SyncConnection";
import { SignalingConnection } from "../util/SignalingConnection";
import { BaseDataChannel, ObjectStateManager as ObjectStateManager } from "./BaseDataChannel";
import { ControlChannel } from "./ControlChannel";
import { VehicleStatus } from "./dex_interfaces";
import { getRobot, getSignalingUrl, getUser } from "./robocore-config";
import { createPeerConnection, deletePeerConnection, RTCFeed, setAlternateSignalingUrl } from "./webrtc_connection";


export class RobocoreClient {
  public id = '';
  public rtcFeed: RTCFeed | null = null;
  public channels: BaseDataChannel[] = [];
  public sync = new SyncConnection();
  public onConnectionStateChanged: (state: string) => void = () => { };

  constructor(public stateManager: ObjectStateManager) { }

  public getChannel(name: string) {
    return this.channels.find(c => c.getConfiguration().name === name);
  }

  public async connect() {
    await this.sync.load();
    const robot = this.sync.getRobot();
    const user = getUser();
    this.id = robot._id;
    const sessionId = user._id;
    console.log(`connecting to robocore: ${this.id} as user: ${sessionId}`);
    const rtcGroup = `robocore-${sessionId}`;
    let baseUrl = this.sync.getRobotConfig().baseUrl;
    console.log('SETTIG UP WEBRTC CONNECTION WITH URL:', baseUrl);
    this.rtcFeed = await createPeerConnection(
      rtcGroup,
      robot._id,
      robot.token,
      baseUrl,
      (dc:any) => {
        // console.log('connecting channel', dc.label);
        const channel = this.getChannel(dc.label);
        if (channel) {
          channel.connect(dc, this.stateManager);
        } else {
          console.error('Channel not found', dc.label);
        }
      }
    );
    if (!this.rtcFeed) {
      throw new Error('Failed to create RTC feed');
    }
    this.rtcFeed.onConnectionStateChanged = (state: string) => {
      // console.log('connection state is now:', state);
      this.onConnectionStateChanged(state);
      return false;
    };

    console.log('SENDING WAKEUP SIGNALING MESSAGE');
    const signaling = new SignalingConnection({
      group: 'robocore',
      deviceId: robot._id,
      token: robot.token,
      baseUrl,
    });

    await signaling.connect();
    signaling.sendReplace({ connect: sessionId });
    signaling.close();
  }

  public sendControlChannelRequest(req: Partial<VehicleStatus>) {
    const channel = this.getChannel('control') as ControlChannel;
    if (channel) {
      channel.sendRequest(req);
    } else {
      console.error('Control channel not found');
    }
  }

  public async disconnect() {
    console.log(`disconnecting from robocore: ${this.id}`);
    try {
      this.rtcFeed?.signalingConnection.sendReplace({ disconnect: true });
      deletePeerConnection(this.id);
    } catch (e) {
      console.error(e);
    }
  }
}