import { EventEmitter } from "eventemitter3";
import { sleep } from "../util/cf";
import RTCDataChannel from 'react-native-webrtc/lib/typescript/RTCDataChannel';
export interface DataChannelConfiguration {
  name: string;
}

export interface ObjectStateManager {
  updateState(dgram: any): void;
  getChildStateManager(name: string): ObjectStateManager | null;
  getActorId(): string;
}


export abstract class BaseDataChannel extends EventEmitter {
  public dataChannel: RTCDataChannel | null = null;
  public stateManager: ObjectStateManager | null = null;
  private connected = false;
  public abstract getConfiguration(): DataChannelConfiguration;
  public abstract onMessage(ev: any): void;

  public connect(dc: RTCDataChannel, stateManager: ObjectStateManager) {
    this.dataChannel = dc;
    this.stateManager = stateManager;
    (this.dataChannel as any).onmessage = (ev:any) => {
      this.onMessage(ev);
    };
    this.onConnected();
    this.connected = true;
  }

  public isConnected() {
    return this.connected && this.dataChannel !== null && this.dataChannel.readyState === 'open';
  }

  protected onConnected() { }

  public sendBytes(buffer: ArrayBuffer) {
    this.sendUint8Array(new Uint8Array(buffer));
  }

  public async sendUint8Array(data: Uint8Array) {
    try {
      if (!this.isConnected()) {
        return;
      }
      if (data.length < 128000) {
        this.dataChannel!.send(data as any);
      } else {
        // send in 64kb chunks
        const chunkSize = 65536;
        // send a marker first
        const chunks = Math.ceil(data.length / chunkSize);
        const marker = new Uint8Array([0xff, 0xff, 0xff, chunks]);
        this.dataChannel!.send(marker);
        let offset = 0;
        while (offset < data.length) {
          await sleep(10);
          const end = Math.min(offset + chunkSize, data.length);
          this.dataChannel!.send(data.slice(offset, end));
          // console.log('Sent chunk', offset, end);
          offset = end;
        }
      }
    } catch (e) {
      console.error('Error sending data: ', e);
    }
  }

}

export abstract class BaseFloatDataChannel extends BaseDataChannel {

  public send(data: number[]) {
    const buffer = new ArrayBuffer(data.length * 4);
    const view = new Float32Array(buffer);
    view.set(data);
    if (this.isConnected()) {
      this.dataChannel!.send(new Uint8Array(buffer));
    } else {
      console.warn('Data channel is not connected, cannot send data');
    }
  }

  public onMessage(ev: any) {
    const data = new Float32Array(ev.data);
    const dataArr = Array.from(data);
    this.emit('data', dataArr);
    this.onData(dataArr);
  }

  public onData(data: number[]): void {
  }
}

export abstract class BaseJsonDataChannel extends BaseDataChannel {
  public send(data: any) {
    if (this.isConnected()) {
      this.dataChannel!.send(JSON.stringify(data));
    }
  }
  public onMessage(ev: any) {
    try {
      const data = JSON.parse(ev.data);
      // console.log('received data: ', data);
      const firstKey = Object.keys(data)[0];
      if (this.stateManager) {
        if (firstKey.includes('.')) {
          // console.log('received data: ', data);
          const [childName, propertyName] = firstKey.split('.');
          const childStateManager = this.stateManager.getChildStateManager(childName);
          if (childStateManager) {
            const childData = { [propertyName]: data[firstKey] };
            childStateManager.updateState(childData);
          } else {
            console.warn(`Child state manager ${childName} not found`);
          }
        } else {
          console.log('Updating state manager with data: ', data);
          this.stateManager.updateState(data);
        }
      }
    } catch (e) {
      console.error('Error parsing JSON data: ', e);
    }
  }
}