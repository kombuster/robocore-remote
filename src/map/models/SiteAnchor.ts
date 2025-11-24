import { Visual } from "./Visual";
import { CameraPosition } from "../visuals/visual-structs";

export interface LatLonAlt {
  lat: number;
  lon: number;
  alt: number;
}

export interface SiteSettings {
  lastEdit: number;
  cameraPosition?: CameraPosition;

}

export interface SiteGrid {
  size: number; // Size of the grid in meters
  resolution: number; // Resolution of the grid in meters
  blobId: string; // Optional blob ID for grid data
}

export interface SiteAnchor extends Visual {
  mgrs: string;
  tileBlobId: string; // Optional blob ID for tile data
  settings: SiteSettings;
  grid: SiteGrid;
  showBox: boolean;
  showGrid: boolean;
  representingVisualId: string;
}

export function createSiteAnchor(_id = ''): SiteAnchor {
  return {
    _id,
    orgId: "",
    id: "",
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
    location: { lat: 0, lon: 0, alt: 0 },
    type: "",
    siteAnchorId: '',
    mgrs: "",
    tileBlobId: '',
    showBox: true,
    showGrid: true,
    grid: {
      size: 100, // Default grid size
      resolution: 10, // Default grid resolution
      blobId: '', // Optional blob ID for grid data
    },
    settings: { lastEdit: Date.now() },
    representingVisualId: '',
  };
}
