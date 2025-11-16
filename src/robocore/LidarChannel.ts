import { BaseFloatDataChannel } from "./BaseDataChannel";

export class LidarChannel extends BaseFloatDataChannel {
  public data: number[] = [];
  public getConfiguration() {
    return {
      name: 'lidar'
    };
  }
  public onData(data: number[]): void {
    this.data = data;
  }
}