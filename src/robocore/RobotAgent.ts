import { EventEmitter } from "eventemitter3";
import { ObjectStateManager } from "./BaseDataChannel";
import { ControlChannel } from "./ControlChannel";
import { RobocoreClient } from "./RobocoreClient";
import { getRobot } from "./robocore-config";
import { BehaviorDescriptor, NavMode, RobotTwist, Vec3, VehicleStatus } from "./dex_interfaces";
import { MapChannel } from "./MapChannel";
import { CostmapChannel } from "./CostmapChannel";
import { LidarChannel } from "./LidarChannel";

export enum AgentEvents {
  StateChange = 'StateChange',
  AgentStateChange = 'AgentStateChange',
  ViewManagerChange = 'ViewManagerChange'
}

export enum RobotConnectionState {
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'closed',
  Failed = 'failed'
}

export class RobotAgent extends EventEmitter implements ObjectStateManager, VehicleStatus {
  public client = new RobocoreClient(this);
  public controlChannel = new ControlChannel();
  public mapChannel = new MapChannel();
  public costmapChannel = new CostmapChannel();
  public lidarChannel = new LidarChannel();
  
  public connectionState = RobotConnectionState.Disconnected;
  public robot = getRobot();
  public navMode: NavMode = NavMode.Unknown;
  public odom: number[] = [0, 0, 0, 0, 0, 0];
  public navGoal: number[] = [];
  public robotTwist?: RobotTwist | undefined;
  public navPath?: number[] | undefined;
  public behavior?: BehaviorDescriptor | undefined;
  public behaviorStep?: string | undefined;
  public postureMode?: string | undefined;
  public initialPose?: number[] | undefined;
  public mapRequest?: string | undefined;
  public message?: string | undefined;
  public availableCameras: string[] = [];
  public selectedCamera: string = '';
  public recordingStatus: string = '';
  public gps: Vec3 = { x: 0, y: 0, z: 0 };
  constructor() {
    super();
    this.client.channels = [
      this.controlChannel, 
      this.mapChannel,
      this.costmapChannel,
      this.lidarChannel
    ];
    this.client.onConnectionStateChanged = (state: string) => {
      this.connectionState = state as RobotConnectionState;
      this.updateState({ connectionState: this.connectionState });
      console.log('RobotAgent connection state changed to:', state);
      if (state === RobotConnectionState.Connected) {
        setTimeout(() => {
          this.controlChannel.sendRequest({ availableCameras: [] });
        }, 5000);
      }
      return false;
    }
  }
  updateState(dgram: any): void {
    // throw new Error("Method not implemented.");
    Object.assign(this, dgram);
    this.emit(AgentEvents.StateChange, dgram);
    if (dgram.availableCameras) {
      console.log('Available cameras updated:', dgram.availableCameras);
    }
  }
  getChildStateManager(name: string): ObjectStateManager | null {
    return null;
  }
  getActorId(): string {
    const robotId = 'robot-agent-001';
    return robotId;
  }
  public async connect(): Promise<void> {
    await this.client.connect();
    // this.updateState({ connectionState: RobotConnectionState.Connected });

  }
  public async disconnect(): Promise<void> {
    // Disconnect logic here
    await this.client.disconnect();
    // this.updateState({ connectionState: RobotConnectionState.Disconnected });
  }
}