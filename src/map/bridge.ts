import * as THREE from 'three';
import { SyncConnection } from '../sync/SyncConnection';
import URDFLoader from './URDFLoader';

export class Bridge {
  public scene!: THREE.Scene;
  public camera!: THREE.Camera;
  public controls!: any;
  public sync = new SyncConnection();
  // Bridge class implementation
  public async initBridge(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    // this.controls = controls;
    this.scene.background = new THREE.Color('#000000');
    await this.sync.load();
    await this.createRobot();
  }

  public async createRobot() {
    try {
      const blobs = this.sync.dir('blobs');
      if (blobs.length === 0) {
        console.log('No blobs found in sync connection.');
        return;
      }
      const file = blobs[0];
      console.log('Using blob file:', file);

      const zip = await this.sync.unzipToTemp('blobs/' + file);
      // console.log('Read ZIP file:', zip);
      // const files = new Map<string, string | ArrayBuffer>();
      // get files out of zip
      // for every file, create a blob url and index it by its name in a map
      let urdfName = '';
      for (const [path, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          console.log('Found file in ZIP:', path);
          // const data = await file.async(file.name.endsWith('.urdf') ? 'string' : 'arraybuffer')
          // const blob = new Blob([data]);
          if (path.endsWith('.urdf')) {
            urdfName = path;
          }
          // files.set(path, data);
        }
      }
      const loader = new URDFLoader();
      const manager = new THREE.LoadingManager();
      manager.setURLModifier((url) => {
        let filePath = url;
        console.log('Loading resource from URL:', url);
        // Remove any leading slashes for consistency with ZIP paths
        filePath = filePath.replace('../', ''); // Handle relative paths
        filePath = filePath.replace(/^\/+/, '');
        return this.sync.getUnzippedFilePath(filePath);
        // const fileContent = files.get(filePath);
        // if (!fileContent) {
        //   console.warn(`File not found in ZIP: ${filePath}`);
        //   return '';
        // }
        // return URL.createObjectURL(new Blob([fileContent]));
      });
      loader.manager = manager;
      const urdfContent = await this.sync.getUnzippedFileContentAsString(urdfName);
      console.log('URDF content blob:', urdfContent.length);
      // console.log('Parsing URDF:', urdfString);

      const urdf = loader.parse(urdfContent);
      this.scene.add(urdf);
    } catch (error: any) {
      console.error('Failed to create robot from URDF:', error.message);
      console.error(error.stack);
    }
  }


}