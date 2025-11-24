import { Vec3 } from "../models/SyntheticMap";

export interface CameraPosition {
  position: Vec3;
  target: Vec3;
  up: Vec3;
}