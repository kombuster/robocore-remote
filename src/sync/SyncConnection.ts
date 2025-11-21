import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultRCRobocoreConfig, RobocoreConfig } from "../robocore/robocore-config";
import { SignalingConnection } from "../util/SignalingConnection";
import { File, Directory, Paths } from 'expo-file-system/next';
import JSZip from "jszip";

export class SyncConnection {
  public connected: boolean = false;
  public device:any = null;
  public robocoreConfig: RobocoreConfig = defaultRCRobocoreConfig;
  public signaling = new SignalingConnection({});
  public async load() {
    await this.loadConfig();
    this.device = JSON.parse(await AsyncStorage.getItem('robocore_device_info') || 'null');
  }

  public async loadConfig(): Promise<RobocoreConfig> {
    // Implementation for loading the sync configuration
    const configString = await AsyncStorage.getItem('robocore_config');
    if (configString) {
      this.robocoreConfig = JSON.parse(configString);
    }
    return this.robocoreConfig;
  }

  public async saveConfig(config: RobocoreConfig): Promise<void> {
    // Implementation for saving the sync configuration
    this.robocoreConfig = config;
    await AsyncStorage.setItem('robocore_config', JSON.stringify(config));
  }

  public async runSync(onStatus: (status: string) => void = () => {}) {
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
        for(const fileName of Object.keys(zip.files)) {
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

  public async disconnect() {
    // Implementation for disconnecting the sync connection
    this.signaling.close();
    this.connected = false;
  }
}