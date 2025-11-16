export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 extends Vec2 {
  z: number;
}

export interface Vec4 extends Vec3 {
  w: number;
}

export interface Vec6 extends Vec4 {
  u: number;
  v: number;
}

export interface RobotTwist {
  linear: number[];
  angular: number[];
}

export enum RobotPostureMode {
  Unknown = 'unknown',
  WalkReady = 'walk_ready',
  ClassicWalk = 'classic_walk',
  Observe = 'observe',
  Walking = 'walking',
  Transition = 'transition',
  StandDown = 'stand_down',
  Locked = 'locked',
  Gesture = 'gesture',
  Default = 'default' 
}  

export enum NavMode {
  Manual = 'Manual',
  SLAM = 'SLAM',
  Auto = 'Auto',
  Unknown = 'Unknown'
}

export interface BehaviorDescriptor {
  name: string;
  step?: string;
  params: any;
}

export enum RobotRecordingStatus {
  Off = 'off',
  Record = 'record',
  Upload = 'upload',
  Uploaded = 'uploaded',
  Request = 'request',
  Response = 'response'
}

export interface VehicleStatus {
  navMode: NavMode;
  odom: number[];
  navGoal: number[];
  robotTwist?: RobotTwist;
  navPath?: number[];
  behavior?: BehaviorDescriptor;
  behaviorStep?: string;
  postureMode?: string;
  initialPose?: number[];
  mapRequest?: string;
  message?: string;
  availableCameras: string[];
  selectedCamera: string;
  recordingStatus: RobotRecordingStatus | string;
  gps: Vec3;
}

export interface ObjectDetectionMetadata {
  persons: { id: number, name: string }[];
}