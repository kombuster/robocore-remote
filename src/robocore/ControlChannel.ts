import { BaseJsonDataChannel } from "./BaseDataChannel";
import { VehicleStatus } from "./dex_interfaces";

export class ControlChannel extends BaseJsonDataChannel {
  public getConfiguration() {
    return {
      name: 'control'
    };
  }
  public sendRequest(request: Partial<VehicleStatus>) {
    console.log('Sending control request:', request);
    this.send({ request });
  }
}