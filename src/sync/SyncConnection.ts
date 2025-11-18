import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultRCRobocoreConfig, RobocoreConfig } from "../robocore/robocore-config";
import { SignalingConnection } from "../util/SignalingConnection";
import { File, Paths } from 'expo-file-system/next';
import { sign } from "three/tsl";

export class SyncConnection {
  public robocoreConfig: RobocoreConfig = defaultRCRobocoreConfig;
  public signaling = new SignalingConnection({});
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
  public async connect() {
    this.signaling.config.baseUrl = this.robocoreConfig.baseUrl;
    this.signaling.config.deviceId = this.robocoreConfig.deviceId;
    this.signaling.config.token = this.robocoreConfig.token;
    this.signaling.config.group = 'remote-group';
    this.signaling.config.onReplace = (dgram: any) => {
      if (dgram.fileTransfer) {
        const { data, name, chunkIndex, totalChunks } = dgram.fileTransfer;
        const fileData = Buffer.from(data, 'base64');
        const filePath = Paths.document + name;
        const file = new File(filePath);
        const fh = file.open();
        if (chunkIndex === 0) {
          fh.writeBytes(fileData);
          // Start of file transfer
        } else {
          const info = file.info();
          fh.offset = info.size || 0;
          // Append to file
          fh.writeBytes(fileData);
        }
        fh.close();
        this.signaling.sendReplace({ fileTransferAck: { name, chunkIndex, totalChunks } });
      }
    };
    await this.signaling.connect();
  }

  public async disconnect() {
    // Implementation for disconnecting the sync connection
  }
}