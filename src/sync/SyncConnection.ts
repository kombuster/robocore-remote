import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultRCRobocoreConfig, RobocoreConfig } from "../robocore/robocore-config";
import { SignalingConnection } from "../util/SignalingConnection";
import { File, Directory, Paths } from 'expo-file-system/next';
import JSZip from "jszip";
import { BaseModel } from "../map/models/BaseModel";
import { Robot } from "../map/models/Robot";

export class SyncConnection {
  public connected: boolean = false;
  public device: any = null;
  public robocoreConfig: RobocoreConfig = defaultRCRobocoreConfig;
  public signaling = new SignalingConnection({});
  public async load() {
    await this.loadConfig();
    this.device = JSON.parse(await AsyncStorage.getItem('robocore_device_info') || 'null');
  }

  public getRobotConfig(): RobocoreConfig {
    return {
      deviceId: this.device.robot._id,
      token: this.device.robot.token,
      baseUrl: this.robocoreConfig.baseUrl,
    };
  }
  
  public getRobot(): Robot {
    return this.device.robot;
  }

  public async loadConfig(): Promise<RobocoreConfig> {
    // Implementation for loading the sync configuration
    const configString = await AsyncStorage.getItem('robocore_config');
    if (configString) {
      this.robocoreConfig = JSON.parse(configString);
    }
    return this.robocoreConfig;
  }

  public async getRecord<T extends BaseModel>(collection: string, id = ''): Promise<T> {
    let fileName = `${collection}-${id}.json`;
    if (!id) {
      // find the first available record
      const records = this.dir(`records`).filter(name => name.startsWith(collection) && name.endsWith('.json'));
      if (records.length === 0) {
        throw new Error(`No records found in collection: ${collection}`);
      }
      fileName = `${records[0]}`;
    }
    const file = new File(Paths.document.uri + `records/${fileName}`);
    const fh = file.open();
    const recordContent = fh.readBytes(file.info().size || 0);
    fh.close();
    const decoder = new TextDecoder("utf-8");
    const recordString = decoder.decode(recordContent);
    return JSON.parse(recordString) as T;
  }

  public async saveConfig(config: RobocoreConfig): Promise<void> {
    // Implementation for saving the sync configuration
    this.robocoreConfig = config;
    await AsyncStorage.setItem('robocore_config', JSON.stringify(config));
  }

  public async runSync(onStatus: (status: string) => void = () => { }) {
    this.signaling.config.baseUrl = this.robocoreConfig.baseUrl;
    this.signaling.config.deviceId = this.robocoreConfig.deviceId;
    this.signaling.config.token = this.robocoreConfig.token;
    this.signaling.config.group = 'remote-group';
    onStatus('Connecting to signaling server...');
    if (await this.signaling.connect()) {
      const device: any = await this.signaling.getDevice();
      onStatus(`Syncing device: ${device.name}`);
      this.device = device;
      await AsyncStorage.setItem('robocore_device_info', JSON.stringify(device));
      const remoteId = device._id;
      const remoteFile = `remote-deployment-pack-${remoteId}.zip`;
      onStatus('Downloading deployment package...');
      if (await this.downloadBlob(remoteFile)) {
        // unzip the file
        const zipPath = Paths.document.uri + remoteFile;
        const zipFile = new File(zipPath);
        const zip = new JSZip();
        const zipHandle = zipFile.open();
        await zip.loadAsync(zipHandle.readBytes(zipFile.info().size || 0));
        zipHandle.close();
        const blobs = new Directory(Paths.document.uri + `blobs`);
        if (blobs.info().exists) {
          blobs.delete();
        }
        blobs.create();
        const records = new Directory(Paths.document.uri + `records`);
        if (records.info().exists) {
          records.delete();
        }
        records.create();
        for (const fileName of Object.keys(zip.files)) {
          const zipEntry = zip.files[fileName];
          if (zipEntry.dir) {
            console.log('Skipping directory in zip:', fileName);
            continue;
          }
          console.log('Extracting file from zip:', fileName);
          const buffer = await zipEntry.async('uint8array');
          console.log('Extracted buffer length:', buffer.byteLength);
          const outFile = new File(Paths.document.uri + fileName);
          const fh = outFile.open();
          fh.writeBytes(buffer);
          fh.close();
          console.log('Extracted file from zip:', fileName);
          onStatus(`Extracted file: ${fileName}`);
        }
      } else {
        onStatus('Failed to download deployment package.');
      }
    }
    this.disconnect();
    setTimeout(() => onStatus(''), 3000);
  }

  public async downloadBlob(blobName: string, localName?: string): Promise<boolean> {
    try {
      if (!localName) {
        localName = blobName;
      }
      const blobUrl = this.device.creds.robocoreBlobUrl;
      const remoteId = this.device._id;
      const url = blobUrl.replace('?', `/${blobName}?`);
      return await this.downloadFile(url, localName);
    } catch (error) {
      console.error('Failed to download blob:', error);
      return false;
    }
  }

  public async downloadFile(url: string, local: string): Promise<boolean> {
    try {
      const localFile = new File(Paths.document.uri + local);
      // console.log('Downloading file from', url, 'to', localFile.uri);
      if (localFile.info().exists) {
        console.log('File already exists, deleting:', localFile.uri);
        localFile.delete();
      }
      await File.downloadFileAsync(url, localFile);
      return true;
    } catch (error) {
      console.error('Failed to download file:', error);
      return false;
    }
  }

  public async unzipToTemp(zipPath: string): Promise<JSZip> {
    const zipFile = new File(Paths.document.uri + zipPath);
    const zip = new JSZip();
    const zipHandle = zipFile.open(); 
    const content = await zip.loadAsync(zipHandle.readBytes(zipFile.info().size || 0));
    zipHandle.close();
    const tempo = new Directory(Paths.document.uri + 'temp');
    if (tempo.info().exists) {
      tempo.delete();
    }
    tempo.create();
    for (const fileName of Object.keys(content.files)) {
      const zipEntry = content.files[fileName];
      if (zipEntry.dir) {
        const dir = new Directory(tempo.uri + fileName);
        dir.create();
        continue;
      }
      console.log('Extracting file from zip:', fileName);
      const buffer = await zipEntry.async('uint8array');
      console.log('Extracted buffer length:', buffer.byteLength);
      const outFile = new File(tempo.uri + fileName);
      
      outFile.create();
      const fh = outFile.open();
      fh.writeBytes(buffer);
      fh.close();
      console.log('Extracted file from zip:', fileName);
    }
    return content;
  }
  public getUnzippedFilePath(zipPath: string): string {
    const tempo = new Directory(Paths.document.uri + 'temp');
    const targetFile = new File(tempo.uri + zipPath);
    return targetFile.uri;
  }
  public async getUnzippedFileContentAsString(zipPath: string): Promise<string> {
    const uri = this.getUnzippedFilePath(zipPath);
    const file = new File(uri);
    const fh = file.open();
    const content = fh.readBytes(file.info().size || 0);
    const decoder = new TextDecoder("utf-8");
    const contentString = decoder.decode(content);
    fh.close();
    return contentString;
  }

  public dir(dir: string): string[] {
    const d = new Directory(Paths.document.uri + dir);
    if (!d.info().exists) {
      return [];
    }
    return d.list().map(file => file.name);
  }

  public async readZip(zipPath: string): Promise<JSZip> {
    const zipFile = new File(Paths.document.uri + zipPath);
    const zip = new JSZip();
    const zipHandle = zipFile.open(); 
    const content = await zip.loadAsync(zipHandle.readBytes(zipFile.info().size || 0));
    zipHandle.close();
    return content;
  }

  public async disconnect() {
    // Implementation for disconnecting the sync connection
    this.signaling.close();
    this.connected = false;
  }
}