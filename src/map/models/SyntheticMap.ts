import { OrgOwnedModel } from "./BaseModel";

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

export interface Pose {
  position: Vec3;
  orientation: Vec3;
}

export interface Twist {
  linear: Vec3;
  angular: Vec3;
}

export const ZeroTwist: Twist = {
  linear: { x: 0, y: 0, z: 0 },
  angular: { x: 0, y: 0, z: 0 },
}



export interface FlooredObject {
  floor: number;
}

export interface ScriptableMapObject {
  script: string;
  maxSpeed: number;
}

export interface PosableMapObject extends FlooredObject, ScriptableMapObject {
  pose: Vec4;
  id: string;
  calloutTemplate?: string;
}

export interface MapSensor {
  type: string;
  mountLocation: Vec3;
  mountRotation: Vec3;
}

export interface MapRobot extends PosableMapObject {
  sensors: MapSensor[];
}

// export interface MapPoliceMan extends PosableMapObject { }

export interface MapBadGuy extends PosableMapObject { }

export interface MapWall extends FlooredObject {
  points: Vec2[];
  height?: number;
  type?: string;
  definesFloor?: boolean;
}

export interface MapPoliceCar extends PosableMapObject { }

export interface MapWhiteVan extends PosableMapObject { }

export interface MapTrafficCone extends PosableMapObject { }

export interface MapPoliceWoman extends PosableMapObject { }

export interface MapSwatMen extends PosableMapObject { }

export interface LightStands extends PosableMapObject { }

export interface MapCyberGirls extends PosableMapObject { }

export interface MapHydroponics extends PosableMapObject { }

export interface MapGarden extends PosableMapObject { }

export interface HouseFactory extends PosableMapObject { }

export interface MapWarehouse extends PosableMapObject { }

export interface MapOfficeFactory extends PosableMapObject { }

export interface MapOffice2Factory extends PosableMapObject { }

export interface MapSchoolBus extends PosableMapObject { }

export interface MapGirls extends PosableMapObject { }

export interface MapBoys extends PosableMapObject { }

export interface MapSwatMen2 extends PosableMapObject { }

export interface MapDrone extends PosableMapObject { }

export interface MapDroneRobot extends MapRobot { }

export interface MapFlowerBed extends PosableMapObject { }

export interface MapSolarPanel extends PosableMapObject { }

export interface MapSolarPanelsOnly extends PosableMapObject { }

export interface MapCuteGarden extends PosableMapObject { }

export interface MapRobotArm extends PosableMapObject { }

export interface MapConveyorBelt extends PosableMapObject { }

export interface MapMiningTruck extends PosableMapObject { }

export interface MapCamera extends PosableMapObject {
  tilt: number;
}

export interface MapAsset extends PosableMapObject {
  assetId: string;
}

export enum RegionMaterial {
  None = "None",
  Asfalt = "Asfalt",
  HangarFloor = "HangarFloor",
  Smoke = "Smoke", // Fire material for special regions
  US = "US", // United States
}

export interface Region extends PosableMapObject {
  size: Vec3;
  color: string;
  label: string;
  link?: string;
  elevation: number;
  material?: RegionMaterial; // Material type for the region
  fontSize?: number; // Optional font size for the label
  isExplorable?: boolean;
  isGate?: boolean;

  wallThickness?: number; // Thickness of the walls, if applicable
}

export interface ImportedSlamMap extends PosableMapObject {
  blobStorageId: string;
  resolution: number;
}

export interface MapFloor {
  corners: Vec2[];
  wallHeight: number;
}

export interface Tunnel {
  label: string;
  start: [number, number, number];
  end: [number, number, number];
  width: number;
  height: number;
  branches?: Tunnel[];
}

export interface MapTunnel extends PosableMapObject {
  tunnelYaml: string;
  tunnelVisibility: number;
}

export interface ScenarioBlockOutput {
  condition: string; // The condition that triggers this output
  blockId: string; // The ID of the block that this output connects to
}

export interface ScenarioBlock {
  id: string;
  actorId: string;
  type: string; // Type of the block (e.g., "reset")
  text: string;
  isBuilt: boolean;
  outputs: ScenarioBlockOutput[];
  position: Vec2; // Position of the block in the scenario
}

export interface Scenario {
  id: string; // Unique identifier for the scenario
  name: string; // Name of the scenario
  blocks: ScenarioBlock[]; // List of blocks in the scenario
}


export interface SyntheticMap extends OrgOwnedModel {
  name: string;
  description: string;
  cameraPose: Vec6;
  settings: {
    showGrid: boolean,
    showBoundingBox: boolean,
    showFloor: boolean,
    floorSize: number,
    lightIntensity: number,
    ambientLightIntensity: number,
    siteId: string,
    buildAreaRadius: number,
    elevationOffset: number,
    terrainVisibility: number,
    elevationGrid?: boolean
  };
  environment: string;
  floorTexture: string;
  robots: MapRobot[];
  droneRobots: MapDroneRobot[];
  badGuys: MapBadGuy[];
  walls: MapWall[];
  policeCars: MapPoliceCar[];
  whiteVans: MapWhiteVan[];
  trafficCones: MapTrafficCone[];
  policeWomen: MapPoliceWoman[];
  swatMen: MapSwatMen[];
  lightStands: LightStands[];
  cyberGirls: MapCyberGirls[];
  hydroponics: MapHydroponics[];
  gardens: MapGarden[];
  houses: HouseFactory[];
  warehouses: MapWarehouse[];
  offices: MapOfficeFactory[];
  offices2: MapOffice2Factory[];
  schoolBuses: MapSchoolBus[];
  girls: MapGirls[];
  boys: MapBoys[];
  swatMen2: MapSwatMen2[];
  drones: MapDrone[];
  flowerBeds: MapFlowerBed[];
  solarPanels: MapSolarPanel[];
  solarPanelsOnly: MapSolarPanelsOnly[];
  cuteGardens: MapCuteGarden[];
  robotArms: MapRobotArm[];
  conveyorBelts: MapConveyorBelt[];
  regions: Region[];
  miningTrucks: MapMiningTruck[];
  assets: MapAsset[];
  cameras: MapCamera[];
  importedSlamMaps: ImportedSlamMap[];
  mapFloor: MapFloor;
  tunnels: MapTunnel[];
  scenarios: Scenario[]; // Optional scenario for the map
}

export function createSyntheticMap(_id = ""): SyntheticMap {
  return {
    _id,
    orgId: "",
    name: "",
    description: "",
    cameraPose: { x: 1, y: 1, z: 5, w: 0, u: 0, v: 0 },
    environment: "Red Galaxy",
    robots: [],
    droneRobots: [],
    badGuys: [],
    walls: [],
    policeCars: [],
    whiteVans: [],
    trafficCones: [],
    policeWomen: [],
    swatMen: [],
    lightStands: [],
    cyberGirls: [],
    hydroponics: [],
    gardens: [],
    houses: [],
    warehouses: [],
    offices: [],
    offices2: [],
    schoolBuses: [],
    settings: {
      showGrid: false,
      showFloor: true,
      showBoundingBox: false,
      lightIntensity: 10,
      ambientLightIntensity: 5,
      siteId: "",
      buildAreaRadius: 100,
      elevationOffset: 0,
      terrainVisibility: 1,
      floorSize: 200,
    },
    floorTexture: "sand",
    girls: [],
    boys: [],
    swatMen2: [],
    drones: [],
    flowerBeds: [],
    solarPanels: [],
    solarPanelsOnly: [],
    cuteGardens: [],
    robotArms: [],
    conveyorBelts: [],
    regions: [],
    miningTrucks: [],
    assets: [],
    cameras: [],
    mapFloor: {
      corners: [],
      wallHeight: 4,
    },
    importedSlamMaps: [],
    tunnels: [],
    scenarios: [],
  }
}
