import * as THREE from 'three';
export class Bridge {
  
  // Bridge class implementation
  public async initScene(scene: THREE.Scene) {
    scene.background = new THREE.Color('lightgrey');
  }
}