import { OrgOwnedModel } from "./BaseModel";
import { Vec3, Vec4 } from "./SyntheticMap";
import { CameraPosition } from "../visuals/visual-structs";

export interface ModelAdaptation {
  scale: number;
  rotation: Vec3;
  position: Vec3;
}

export interface ModelSource {
  url?: string;
  packageRoot?: string;
  blobId?: string;
}

export interface ModelSettings {
  cameraPosition?: CameraPosition;
  lastEdit: number;
}

export enum MotionMapperType {
  AnimatedGLB = 'animated_glb',
  QuadrupedRobot = 'quadruped_robot',
  RobotArm = 'robot_arm',
  Unknown = 'unknown',
}

export enum GLBAnimationType {
  Unknown = 'unknown',
  Walk = 'walk',
  Idle = 'idle',
  Setup = 'setup'
}

export interface ModelPart {
  id: string;
  position: Vec3;
  rotation: Vec3;
  parent: string;
}

export interface MotionMapper {
  type: MotionMapperType;
}

export interface GLBMotionMapper extends MotionMapper {
  type: MotionMapperType.AnimatedGLB;
  animationMap: {
    [key: string]: GLBAnimationType;
  }
}

export interface QRMotionMapper extends MotionMapper {
  type: MotionMapperType.QuadrupedRobot;
  jointMap: string[][];
  walkingHeight: number;
  thighLength: number;
  shinLength: number;
  stride: number;
  invertedY: boolean;
}

export enum ArmJointRole {
  None = 'none',
  BaseZ = 'baseZ',
  BaseY = 'baseY',
  ElbowY = 'elbowY',
  WristZ = 'wristZ',
  BusinessEnd = 'businessEnd',
  Camera = 'camera'
}

export interface ArmJointConfig {
  name: string;
  role: ArmJointRole;
  zeroAngle: number;
  invert: boolean;
  offset: Vec3;
}

export interface ArmMotionMapper extends MotionMapper {
  type: MotionMapperType.RobotArm;
  joints: { [key in ArmJointRole]: ArmJointConfig };
}

export interface CollisionBox {
  size: Vec3;
  position: Vec3;
  rotation: Vec3;
}

export interface CollisionMap {
  boxes: CollisionBox[];
}

export enum AgentType {
  Static = 'static',
  Human = 'human',
  Robot = 'robot',
  RobotArm = 'robot_arm',
  Vehicle = 'vehicle',
  Ship = 'ship',
  Airborne = 'airborne',
  Dragonfly = "Dragonfly",
}

export interface Model extends OrgOwnedModel {
  source: ModelSource;
  adaptation: ModelAdaptation;
  name: string;
  category: string;
  settings: ModelSettings;
  motionMapper: MotionMapper;
  collisionMap: CollisionMap;
  agentType: AgentType;
  parts: ModelPart[];
  manifest: string;
}

export function createModel(_id = ''): Model {
  const motionMapper: GLBMotionMapper = {
    type: MotionMapperType.AnimatedGLB,
    animationMap: {}
  };
  return {
    _id,
    orgId: "",
    source: {
      url: "",
      packageRoot: "",
      blobId: ""
    },
    adaptation: {
      scale: 1.0,
      rotation: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 }
    },
    name: "",
    category: "",
    settings: {
      cameraPosition: undefined,
      lastEdit: Date.now()
    },
    motionMapper: motionMapper,
    collisionMap: {
      boxes: []
    },
    agentType: AgentType.Static,
    parts: [],
    manifest: "",
  };
}
