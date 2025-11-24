import { OrgOwnedModel } from "./BaseModel";
import { Vec4 } from "./SyntheticMap";

export interface RobotDeployment {
  robotId: string;
  pose: Vec4;
}

export interface RemoteDeployment {
  remoteId: string;
  
}

export interface RobotSlamMap {
  robotId: string;
  offsetX: number;
  offsetY: number;
  resolution: number;
  storageBlobId: string;
  data?: ArrayBuffer;
}

export interface Deployment extends OrgOwnedModel {
  name: string;
  robots: RobotDeployment[];
  remotes: RemoteDeployment[];
  siteId: string;
  slamMaps: RobotSlamMap[];
  recordings: string[];
}

export function createDeployment(_id = ''): Deployment {
  return {
    _id,
    name: "",
    orgId: "",
    siteId: "",
    robots: [],
    slamMaps: [],
    recordings: [],
    remotes: [],
  };
}
