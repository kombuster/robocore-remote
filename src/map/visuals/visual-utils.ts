import { Vec3, Vec4 } from "../models/SyntheticMap";
import * as THREE from "three";
import { normalizeAngleToPi } from "../utils/spatial";
import { L } from "ace-builds-internal/lib/bidiutil";

export function vec3Equal(a: Vec3, b: Vec3): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

export function vec4Equal(a: Vec4, b: Vec4): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
}


export function toVector3(vec: Vec3 | number[]): THREE.Vector3 {
  if (!vec) return new THREE.Vector3(0, 0, 0);
  if (Array.isArray(vec)) {
    return new THREE.Vector3(vec[0], vec[1], vec[2]);
  }
  return new THREE.Vector3(vec.x, vec.y, vec.z);
}

export function toEuler(vec: Vec3 | number[], fromDegrees = true): THREE.Euler {
  if (!vec) return new THREE.Euler(0, 0, 0);
  if (Array.isArray(vec)) {
    vec = { x: vec[0], y: vec[1], z: vec[2] };
  }
  const euler = new THREE.Euler(vec.x, vec.y, vec.z);
  if (fromDegrees) {
    euler.x = THREE.MathUtils.degToRad(vec.x);
    euler.y = THREE.MathUtils.degToRad(vec.y);
    euler.z = THREE.MathUtils.degToRad(vec.z);
  }
  return euler;
}

export function toVec3(vec: THREE.Vector3): Vec3 {
  return { x: vec.x, y: vec.y, z: vec.z };
}

export function isClose(a: Vec3, b: Vec3, threshold = 0.01): boolean {
  return Math.abs(a.x - b.x) < threshold &&
    Math.abs(a.y - b.y) < threshold &&
    Math.abs(a.z - b.z) < threshold;
}

export function cloneVec3(vec: Vec3): Vec3 {
  return { x: vec.x, y: vec.y, z: vec.z };
}

export function copyVec3(source: Vec3, target: Vec3): void {
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
}

export function copyVec4(source: Vec4, target: Vec4): void {
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
  target.w = source.w;
}

export function copyToEuler(source: Vec3, target: THREE.Euler): void {
  target.set(source.x, source.y, source.z, 'XYZ');
}

export function copyFromEuler(source: THREE.Euler, target: Vec3): void {
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
}

export function alignObject(object: THREE.Object3D, normal: THREE.Vector3): void {
  const n = normal;
  const roll = Math.atan2(-n.y, n.z);
  const pitch = Math.atan2(n.x, Math.sqrt(n.y * n.y + n.z * n.z)); // Pitch around Y-axis
  object.rotation.set(roll, pitch, 0);
}

export function vectorFromParentToChildLocal(parent: THREE.Object3D, child: THREE.Object3D, vector: THREE.Vector3) {
  // Ensure world matrices are up-to-date
  parent.updateMatrixWorld();
  child.updateMatrixWorld();
  // Get parent's world matrix
  const parentWorldMatrix = parent.matrixWorld;
  // Get child's world matrix and its inverse
  const childWorldMatrixInverse = new THREE.Matrix4().copy(child.matrixWorld).invert();
  // Transform the vector from parent's local space to world space
  const vectorWorld = vector.clone().applyMatrix4(parentWorldMatrix);
  // Transform the vector from world space to child's local space
  const vectorLocal = vectorWorld.applyMatrix4(childWorldMatrixInverse);
  return vectorLocal;
}

export function vectorFromChildToParent(parent: THREE.Object3D, child: THREE.Object3D, vector: THREE.Vector3) {
  // Ensure world matrices are up-to-date
  parent.updateMatrixWorld();
  child.updateMatrixWorld();
  // Get parent's world matrix and its inverse
  const parentWorldMatrixInverse = new THREE.Matrix4().copy(parent.matrixWorld).invert();
  // Get child's world matrix
  const childWorldMatrix = child.matrixWorld;
  // Transform the vector from child's local space to world space
  const vectorWorld = vector.clone().applyMatrix4(childWorldMatrix);
  // Transform the vector from world space to parent's local space
  const vectorLocal = vectorWorld.applyMatrix4(parentWorldMatrixInverse);
  return vectorLocal;
}

export function vec3Diff(a: Vec3, b: Vec3, normalize = false) {
  let diff = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
  if (normalize) {
    diff.x = normalizeAngleToPi(diff.x);
    diff.y = normalizeAngleToPi(diff.y);
    diff.z = normalizeAngleToPi(diff.z);
  }
  return diff;
}

export function alignSite(object: THREE.Object3D, normal: THREE.Vector3): void {
  // Ensure normal is normalized
  const targetZ: THREE.Vector3 = normal.clone().normalize();

  // Get parent's world Z-axis (or world Z if no parent)
  const parentZ: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  if (object.parent) {
    object.parent.localToWorld(parentZ);
    // Convert to object's local space (world-to-local)
    object.worldToLocal(parentZ);
    // Re-normalize after transformation
    parentZ.normalize();
  }

  // Compute target X-axis: project parent's Z onto plane perpendicular to targetZ
  let targetX: THREE.Vector3 = parentZ.clone();
  const dot: number = targetX.dot(targetZ);
  targetX.sub(targetZ.clone().multiplyScalar(dot)).normalize();

  // If targetX is zero (i.e., parentZ is parallel to normal), choose an arbitrary perpendicular vector
  if (targetX.lengthSq() < 0.0001) {
    targetX = new THREE.Vector3(1, 0, 0);
    if (Math.abs(targetZ.dot(targetX)) > 0.9999) {
      targetX.set(0, 1, 0);
    }
    targetX.sub(targetZ.clone().multiplyScalar(targetZ.dot(targetX))).normalize();
  }

  // Compute target Y-axis as cross product of targetZ and targetX
  const targetY: THREE.Vector3 = new THREE.Vector3().crossVectors(targetZ, targetX).normalize();

  // Create rotation matrix
  const matrix: THREE.Matrix4 = new THREE.Matrix4();
  matrix.makeBasis(targetX, targetY, targetZ);

  // Apply rotation to object
  object.setRotationFromMatrix(matrix);
}

export function ensureChild<T extends THREE.Object3D>(
  parent: THREE.Object3D,
  name: string,
  ctor: new () => T
): T {
  const existingChild = parent.getObjectByName(name);
  if (existingChild) {
    return existingChild as T;
  }
  const child = new ctor();
  child.name = name;
  parent.add(child);
  return child as T;
}

export function buildWall(
  parent: THREE.Object3D,
  points: THREE.Vector3[],
  height: number,
  sinkage = 0.5,
  material?: THREE.Material,
  thickness = 0.2,
  skipIndexes: number[] = []
): void {

  material = material || new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true, opacity: 0.15
  });
  for (let i = 0; i < points.length; i++) {
    if (skipIndexes.includes(i)) continue;
    const nextIndex = (i + 1) % points.length;
    const wallGeometry = new THREE.BoxGeometry(
      points[i].distanceTo(points[nextIndex]),
      thickness,
      height
    );
    const wall = new THREE.Mesh(wallGeometry, material);
    wall.name = `wall_${i}`;
    wall.position.copy(points[i].clone().lerp(points[nextIndex], 0.5));
    const angleBetween = angleFromTo(points[i], points[nextIndex]);
    // console.log(`Building  wall from ${points[i].toArray()} to ${points[nextIndex].toArray()} at angle ${angleBetween}`);
    wall.rotation.z = angleBetween;
    wall.position.z = height * sinkage;
    parent.add(wall);
  }
}
export function angleFromTo(v1: THREE.Vector3, v2: THREE.Vector3): number {
  const delta = v2.clone().sub(v1);
  const angle = Math.atan2(delta.y, delta.x);
  return normalizeAngleToPi(angle);
}

export function isNotZero(vec: Vec3): boolean {
  return vec.x !== 0 || vec.y !== 0 || vec.z !== 0;
}

export function addRotation(object: THREE.Object3D, rotation: THREE.Vector3, scalar = 1.0): void {
  object.rotation.x = normalizeAngleToPi(object.rotation.x + rotation.x * scalar);
  object.rotation.y = normalizeAngleToPi(object.rotation.y + rotation.y * scalar);
  object.rotation.z = normalizeAngleToPi(object.rotation.z + rotation.z * scalar);
}

export function lowPassFilter(oldValue: number, newValue: number, alpha: number): number {
  return oldValue * (1 - alpha) + newValue * alpha;
}