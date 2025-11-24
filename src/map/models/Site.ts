import { OrgOwnedModel } from "./BaseModel";

export interface Site extends OrgOwnedModel {
  name: string;
  simId: string;
  location: string; // mgrs
  gridSize: number;
  cellSize: number;
  elevation: number;
  numberOfTiles: number;
}

export function createSite(_id = ''): Site {
  return {
    _id,
    orgId: "",
    name: "",
    simId: "",
    location: "",
    gridSize: 0,
    cellSize: 0,
    elevation: 0,
    numberOfTiles: 0,
  };
}
