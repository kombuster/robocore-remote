import { OrgOwnedModel } from "./BaseModel";
import { ObjectPosAndRot } from "./ObjectPosAndRot";
export enum ActorType {
  Drone = "drone",
  Elevator = "elevator",
  Robot = "robot",
  Person = 'person',
  Camera = 'camera',
  Vehicle = 'vehicle',
  None = 'none',
  TowedAirplane = 'towedAirplane',
  WheeledRobot = 'wheeledRobot',
  Dragonfly = 'dragonfly',
  C17 = "C17",
  Sat = "sat",
}

export interface Asset extends OrgOwnedModel, ObjectPosAndRot {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  category: string;
  // modelData?: ArrayBuffer;
  actorType?: ActorType;
  description?: string;
  isScanable?: boolean;
}

export function createAsset(_id = '', orgId = ''): Asset {
  return {
    _id,
    name: "",
    rotation: [1.57, 1.57, 0],
    position: [0, 0, 0],
    scale: 1,
    category: "",
    description: "",
    orgId,
    actorType: ActorType.None,
    isScanable: false,
  };
}
