import * as THREE from 'three';
import { isClose } from './visual-utils';
export interface IKArm {
  setPosition(pos: THREE.Vector3): void;
  getPosition(): THREE.Vector3;
}

export interface IKSegment {
  target: THREE.Vector3;
  duration: number; // Duration in seconds
}

export function ikSeg(duration: number, x: number, y: number, z: number): IKSegment {
  const target = new THREE.Vector3(x, y, z);
  return {
    target,
    duration
  };
}


export class IKAnime {
  public inSyncMode = false;
  public boost: number = 1.0;
  public targetSegmentIndex: number = 0;
  public previousSegmentIndex: number = 0;
  public pos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  constructor(
    public name: string,
    public trajectory: IKSegment[],
    public startPointIndex: number = 0,
    public arms: IKArm[] = []) {
  }

  syncZero(): void {
    this.setTargetIndex(0);
    this.setPosition(this.trajectory[0].target);
  }

  syncStart(): void {
    this.setTargetIndex(this.startPointIndex);
    this.previousSegmentIndex = 0;
    this.setPosition(this.trajectory[this.targetSegmentIndex].target);
  }

  private setTargetIndex(index: number): void {
    this.previousSegmentIndex = this.targetSegmentIndex;
    this.targetSegmentIndex = index;
    const segment = this.trajectory[this.targetSegmentIndex];
    this.velocity = segment.target.clone()
      .sub(this.pos)
      .divideScalar(segment.duration / this.boost);
  }

  private setPosition(pos: THREE.Vector3): void {
    this.pos.copy(pos);
    for (const arm of this.arms) {
      arm.setPosition(pos);
    }
  }

  public render(delta: number) {
    let segment = this.trajectory[this.targetSegmentIndex];
    this.inSyncMode = false;
    if (isClose(this.pos, segment.target, 0.05)) {
      if (this.targetSegmentIndex === this.startPointIndex && this.previousSegmentIndex) {
        this.inSyncMode = true;
      }
      const nextSegmentIndex = this.targetSegmentIndex < this.trajectory.length - 1 ? this.targetSegmentIndex + 1 : 0; 
      this.setTargetIndex(nextSegmentIndex);
      segment = this.trajectory[this.targetSegmentIndex];
    }
    const move = this.velocity.clone().multiplyScalar(this.boost * delta);
    this.setPosition(this.pos.add(move));
    // this.segmentTime += delta;
    // Implement rendering logic here
  }
}