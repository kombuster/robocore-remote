import { OrgOwnedModel } from "./BaseModel";

export enum OrgBlobType {
  Unknown = 'unknown',
  GLB = 'glb',
  URDF = 'urdf',
  EvelationGrid = 'evelationGrid',
  Tiles = 'tiles',
}

export interface OrgBlob extends OrgOwnedModel {
  type: OrgBlobType;
  size: number; // Size in bytes
}

export function createOrgBlob(_id = ''): OrgBlob {
  return {
    _id,
    orgId: "",
    type: OrgBlobType.Unknown,
    size: 0,
  };
}
