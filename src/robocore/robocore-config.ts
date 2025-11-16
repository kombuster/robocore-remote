import { Robot, RobotDeploymentType, RobotType } from "./Robot";
import { User, UserRole } from "./User";

export interface RobocoreConfig {
  deviceId: string;
  token: string;
  baseUrl: string;
  groupId: string;
}

// const baseUrl = 'ws://192.168.86.32:28801';
const baseUrl = `ws://192.168.0.169:28801`;

export const defaultVideoRobocoreConfig: RobocoreConfig = {
  deviceId: '6778536961b13a6c98861c9f',
  groupId: 'video-676f4ed0ff2002851a9fca18',
  token: '8fa4e486-2467-41c9-a4d3-c7d6f2d79e59',
  baseUrl,
};

export const defaultRCRobocoreConfig: RobocoreConfig = {
  deviceId: '6778536961b13a6c98861c9f',
  groupId: 'rc-676f4ed0ff2002851a9fca19',
  token: '8fa4e486-2467-41c9-a4d3-c7d6f2d79e59',
  baseUrl,
};

export function getVideoRobocoreConfig(): RobocoreConfig {
  return { ...defaultVideoRobocoreConfig };
}

export function getRCRobocoreConfig(): RobocoreConfig {
  return { ...defaultRCRobocoreConfig };
} 

export function getSignalingUrl(): string {
  return defaultRCRobocoreConfig.baseUrl;
} 

export function getRobot(): Robot {
  return {
    _id: defaultRCRobocoreConfig.deviceId,
    name: 'Robocore Robot',
    token: defaultRCRobocoreConfig.token,
    description: '',
    location: '',
    deploymentType: RobotDeploymentType.Live,
    type: RobotType.Quadruped,
    orgId: '',
    roboCoreVersion: '1.0.0',
    status: 'active',
    yamlContent: '',
  };
}

export function getUser(): User {
  return {
    _id: 'remote1234567890',
    orgId: '',
    name: '',
    userId: '',
    email: '',
    role: UserRole.Operator,
    tenantEmail: '',
  };
}