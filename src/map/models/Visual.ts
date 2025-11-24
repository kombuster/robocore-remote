import { OrgOwnedModel } from "./BaseModel";
import { Vec3 } from "./SyntheticMap";
import { LatLonAlt } from "./SiteAnchor";

export interface Visual extends OrgOwnedModel {
  id: string;
  position: Vec3;
  location: LatLonAlt;
  rotation: Vec3;
  type: string;
  siteAnchorId: string;
}

export function createVisual(_id = ''): Visual {
  return {
    _id,
    orgId: "",
    id: "",
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
    location: { lat: 0, lon: 0, alt: 0 },
    type: "",
    siteAnchorId: '',
  };
}