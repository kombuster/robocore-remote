import { URDFJoint, URDFRobot } from "urdf-loader";
// import { BaseAnimator } from "./BaseAnimator";
import { Model, QRMotionMapper } from "../models/Model";
// import { ModelLoader } from "../panels/common/ModelLoader";
import * as THREE from "three";
import { IKAnime, IKArm, ikSeg, IKSegment } from "./IKAnime";
import { RobotTwist } from "../../robocore/dex_interfaces";
// import { RobotTwist } from "../api/robocore/dex_interfaces";

export enum QRLegs {
  FL = 0,
  FR = 1,
  HL = 2,
  HR = 3,
}

export enum QRLegJoints {
  HipX = 0,
  HipY = 1,
  Knee = 2,
  Ankle = 3,
}

export class QRLeg implements IKArm {
  public hipX: URDFJoint;
  public hipY: URDFJoint;
  public knee: URDFJoint;
  public ankle: URDFJoint;
  public padPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  constructor(public animator: QRAnimator, public legIndex: QRLegs) {
    const mapper = animator.mapper;
    const jointKeys = mapper.jointMap[legIndex];
    this.hipX = animator.robot.joints[jointKeys[QRLegJoints.HipX]];
    this.hipY = animator.robot.joints[jointKeys[QRLegJoints.HipY]];
    this.knee = animator.robot.joints[jointKeys[QRLegJoints.Knee]];
    this.ankle = animator.robot.joints[jointKeys[QRLegJoints.Ankle]]; // Assuming ankle is the next joint
    // if (!this.ankle) {
    //   // look for mesh
    //   console.log('jointKeys:', jointKeys);
    //   // const meshName = jointKeys[QRLegJoints.Ankle];
    //   // console.log(`Looking for ankle joint mesh: ${meshName}`);
    //   // const mesh = animator.robot.getObjectByName(meshName);
    //   // console.log(`Found ankle joint mesh: ${mesh ? 'yes' : 'no'}`);
    //   // if (mesh) {
    //   //   this.ankle = mesh;
    //   // } else {
    //   //   console.warn(`Ankle joint mesh not found for leg ${legIndex}. Using a placeholder.`);
    //   //   // this.ankle = new THREE.Object3D(); // Placeholder if no mesh is found
    //   // }
    // }
    // console.log(this);
  }

  public setPosition(pos: THREE.Vector3) {
    const invertedXPos = pos.clone();
    invertedXPos.x = -invertedXPos.x;
    const { hipY, kneeY } = this.getAngles(invertedXPos);
    if (!this.hipY || !this.knee) {
      console.warn(`Leg ${this.legIndex} does not have hipY or knee joint defined.`);
      return;
    }
    this.hipY.setJointValue(hipY);
    this.knee.setJointValue(kneeY);
    this.padPosition.copy(pos);
  }

  public getPosition() {
    return this.padPosition;
  }

  public getAngles(pos: THREE.Vector3) {
    const length = pos.length();
    const alpha = Math.asin(pos.x / length);
    const hipRatio = this.animator.mapper.thighLength /
      (this.animator.mapper.thighLength + this.animator.mapper.shinLength);
    const hipSide = hipRatio * length;
    const shinSide = length - hipSide;
    const hipY = Math.acos(hipSide / this.animator.mapper.thighLength);
    const kneeY = Math.acos(shinSide / this.animator.mapper.shinLength) + hipY;
    if (this.animator.mapper.invertedY) {
      return { hipY: -hipY - alpha, kneeY };
    } else {
      return { hipY: hipY + alpha, kneeY: -kneeY };
    }
  }

  public estimateLenths() {
    const thighLength = this.hipY.getWorldPosition(new THREE.Vector3()).distanceTo(this.knee.getWorldPosition(new THREE.Vector3()));
    const shinLength = this.knee.getWorldPosition(new THREE.Vector3()).distanceTo(this.ankle.getWorldPosition(new THREE.Vector3()));
    this.animator.mapper.thighLength = thighLength;
    this.animator.mapper.shinLength = shinLength + 0.03;
  }
}

export enum QRAnimatorStates {
  Idle = 'idle',
  Walking = 'walking',
}

export class QRAnimator {
  mapper: QRMotionMapper;
  legs: QRLeg[] = [];
  animes: IKAnime[] = [];
  state: QRAnimatorStates = QRAnimatorStates.Idle;

  constructor(public robot: URDFRobot, public model: Model) {
    this.mapper = this.model.motionMapper as QRMotionMapper;
    for (let i = 0; i < 4; i++) {
      this.legs.push(new QRLeg(this, i as QRLegs));
    }
    this.walk();
    this.stop();
  }

  public getAnimations(): string[] {
    return ['walk'];
  }

  public playAnimation(name: string): void {
    if (name === 'walk') {
      this.walk();
    } else {
      console.warn(`Unknown animation: ${name}`);
    }
  }

  public walk(twist: RobotTwist = { linear: [1, 0, 0], angular: [0, 0, 0] }) {
    const sum = twist.linear.reduce((a, b) => a + b, 0) + twist.angular.reduce((a, b) => a + b, 0);
    if (this.state !== QRAnimatorStates.Idle && sum === 0) {
      this.stop();
      return;
    }
    if (this.state === QRAnimatorStates.Walking || sum === 0) {
      return;
    }
    const trajectory = this.getWalkTrajectory();
    this.animes = [
      new IKAnime('walkFLHR', trajectory, 0, [this.legs[QRLegs.FL], this.legs[QRLegs.HR]]),
      new IKAnime('walkFRHL', trajectory, 3, [this.legs[QRLegs.FR], this.legs[QRLegs.HL]])
    ];
    this.animes.forEach(anime => anime.syncStart());
    this.state = QRAnimatorStates.Walking;
  }

  public stop() {
    this.animes.forEach(anime => anime.syncZero());
    this.animes = [];
    this.state = QRAnimatorStates.Idle;
  }


  private getWalkTrajectory() {
    const stepRise = this.mapper.stride * 0.5;
    const { walkingHeight, stride } = this.mapper;
    const halfStride = stride / 2;
    const xOffset = halfStride * 0.5;
    const trajectory: IKSegment[] = [
      ikSeg(0.25, 0, 0, -walkingHeight),
      ikSeg(0.25, -halfStride, 0, -walkingHeight),
      ikSeg(0.125, -halfStride + xOffset, 0, -walkingHeight + stepRise),
      ikSeg(0.125, xOffset, 0, -walkingHeight + stepRise),
      ikSeg(0.125, halfStride + xOffset, 0, -walkingHeight + stepRise),
      ikSeg(0.125, halfStride, 0, -walkingHeight),
    ];
    return trajectory;
  }


  public render(delta: number): void {
    // console.log("QRAnimator render called with delta:", delta);
    let sync = false;
    this.animes.forEach(anime => {
      anime.render(delta);
      if (anime.inSyncMode) {
        sync = true;
      }
    });
    if (sync) {
      this.animes.forEach(anime => anime.syncStart());
      this.animes.forEach(anime => anime.render(delta));
    }
  }

  public neutralize() {
    for (const leg of this.legs) {
      leg.hipX.setJointValue(0);
      leg.hipY.setJointValue(0);
      leg.knee.setJointValue(0);
    }
  }
}
