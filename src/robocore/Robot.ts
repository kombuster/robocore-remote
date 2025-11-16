import { OrgOwnedModel } from "./BaseModel";

export enum RobotType {
  Drone = "drone",
  Quadruped = "quadruped",
  Camera = "camera",
  Humanoid = "humanoid",
}

export enum RobotDeploymentType {
  HostedSim = "hostedsim",
  Sim = "sim",
  Live = "live",
}

export const ROBOCORE_BLOB_CONTAINER = 'techmage-robocore';

export interface Robot extends OrgOwnedModel {
  roboCoreVersion: string;
  status: string;
  yamlContent: string;
  name: string;
  token: string;
  description: string;
  location: string; // mgrs? lat/long?
  type: RobotType;
  deploymentType: RobotDeploymentType;
}

export interface SimSensorVideo {
  frame: {
    width: number;
    height: number;
  }
  frequency: number;
}

// scan:
// arc:
//   min: -40.0
//   max: 40.0
// range:
//   min: 0.25
//   max: 8.0
// frequency: 3.0

export interface ScanCfg {
  position: number[];
}

export interface SimScan {
  arc: {
    min: number;
    max: number;
  },
  rays: number;
  range: {
    min: number;
    max: number;
  }
  frequency: number;
  verticalScan?: {
    stepSize: number;
    ringsDown: number;
    ringsUp: number;
  };

}

export interface SimOdom {
  frequency: number;
}

export interface RobotManifest {
  environments: {
    [key: string]: any;
  },
  cfg: {
    sensors: {
      [key: string]: any;
    },
    teleop: {
      speedLimit: {
        linear: number[];
        angular: number[];
      }
    }
  },
  sim: {
    sensors: {
      [key: string]: any;
    }
  }
}

export function createManifest() {
  const m: RobotManifest = {
    cfg: {
      sensors: {
        'scan': {
          position: [0, 0, 0],
        }
      },
      teleop: {
        speedLimit: {
          linear: [0.5, 0.5, 0.0],
          angular: [0.0, 0.0, 0.5],
        },
      },
    },
    environments: {},
    sim: {
      sensors: {
        'video': {
          resolution: {
            width: 640,
            height: 360,
          },
          frequency: 2,
        }
      },
    },
  };
  return m;
}


export function createRobot(_id = ''): Robot {
  return {
    _id,
    orgId: "",
    roboCoreVersion: "",
    status: "",
    yamlContent: "",
    name: "",
    description: "",
    location: "",
    token: "",
    type: RobotType.Quadruped,
    deploymentType: RobotDeploymentType.Sim,
  };
}
