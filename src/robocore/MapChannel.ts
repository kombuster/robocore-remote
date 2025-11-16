import { BaseDataChannel } from "./BaseDataChannel";
import { RobotSlamMap } from "./Deployment";

export class MapChannel extends BaseDataChannel {
  public lastReceivedMap: RobotSlamMap | null = null;
  public onMessage(ev: any): void {
    const data = ev.data;
    // split the data into two buffers, 8 bytes for the first and rest for the second
    const buffer = new Uint8Array(data);
    const originBufferLength = 3 * 4;
    const originBuffer = buffer.slice(0, originBufferLength);
    const mapBuffer = buffer.slice(originBufferLength);
    const originView = new Float32Array(originBuffer.buffer);
    // const mapView = new Uint8Array(mapBuffer.buffer);
    const map: RobotSlamMap = {
      robotId: this.stateManager!.getActorId(),
      offsetX: originView[0],
      offsetY: originView[1],
      resolution: originView[2],
      storageBlobId: '',
      data: mapBuffer.buffer,
    };
    this.lastReceivedMap = map;
    this.emit('map', map);
    // this.renderMap();
  }

  // protected renderMap() {
  //   this.stateManager!.getUIService().getMapFloorFactory().renderSlamMap(this.lastReceivedMap!);
  // }

  public getConfiguration() {
    return {
      name: "map",
    };
  }

}
