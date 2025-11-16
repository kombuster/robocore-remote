import { EventEmitter } from 'eventemitter3';

export interface SignalingConfig {
  group: string;
  deviceId: string;
  token: string;
  slot: string;
  receiver: any;
  baseUrl?: string;
  onMessage: (message: any) => void;
  onOpened: () => void;
  onClosed: () => void;
  onReplace: (dgram: any) => void;
  onUpdate: (dgram: any) => void;
  onError: (error: any) => void;
}

interface Awaited {
  query: any;
  timeout: any;
  resolve: any;
  reject: any;
}

export class SignalingConnection extends EventEmitter {
  public url!: string;
  private ws!: WebSocket;
  private authenticatedServerTime: number = 0;
  public config: SignalingConfig = {
    group: 'empty',
    deviceId: 'none',
    token: '',
    slot: '2',
    onMessage: (message: any) => { },
    onOpened: () => { },
    onClosed: () => { },
    onReplace: (dgram: any) => { },
    onUpdate: (dgram: any) => { },
    onError: (error: any) => {
      console.error(error);
    },
    receiver: null,
  };

  private awaited: Awaited | null = null;

  constructor(config: Partial<SignalingConfig>) {
    super();
    this.config = { ...this.config, ...config };
  }

  public connect(): Promise<boolean> {
    // debugger;
    this.url = `${this.config.baseUrl}/${this.config.group}/${this.config.deviceId}/${this.config.slot}`;
    console.log(`signaling connecting to ${this.url}`);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('connection timeout close ws');
        this.ws.close();
        resolve(false);
      }, 12000);
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        const headers = {
          authorization: `Bearer ${this.config.token}`,
          slot: this.config.slot
        };
        console.log({ headers });
        this.ws.send(JSON.stringify({ headers }));
      };
      this.ws.onerror = (error) => {
        this.config.onError(error);
      };
      this.ws.onmessage = (message) => {
        const msg = JSON.parse(message.data);
        this.config.onMessage(msg);
        // console.log({ msg });
        if (msg.replace) {
          const dgram = msg.replace;
          const firstKey = Object.keys(dgram)[0];
          if (this.config.receiver) {
            const handlerName = `on${firstKey.charAt(0).toUpperCase()}${firstKey.slice(1)}`;
            if (handlerName in this.config.receiver) {
              this.config.receiver[handlerName](dgram[firstKey]);
              return;
            }
          }
          this.config.onReplace(msg.replace);
          this.emit(firstKey, msg.replace[firstKey]);
        } else if (msg.update) {
          this.config.onUpdate(msg.update);
        } else if (msg.error) {
          this.config.onError(msg.error);
        } else if (msg.authenticated) {
          this.authenticatedServerTime = msg.authenticated;
          clearTimeout(timeout);
          resolve(true);
          this.config.onOpened();
        } else if (msg.queryResponse) {
          // console.log('query response', msg.queryResponse);
          if (this.awaited && this.awaited.query === msg.queryResponse.query) {
            clearTimeout(this.awaited.timeout);
            this.awaited.resolve(msg.queryResponse.response);
          }
        } else if (msg.deviceInfo) {
          // console.log('device info', msg.deviceInfo);
          if (this.awaited && this.awaited.query === 'getDevice') {
            clearTimeout(this.awaited.timeout);
            this.awaited.resolve(msg.deviceInfo);
          }
        }
      };
      this.ws.onclose = () => {
        // console.log('ws closed event');
        this.config.onClosed();
      };
    });
  }

  public sendReplace(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('ws not open, cannot send replace');
      console.log({ message });
      return;
    }
    this.ws.send(JSON.stringify({ replace: message }));
  }

  public sendDelete(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('ws not open, cannot send delete');
      return;
    }
    this.ws.send(JSON.stringify({ delete: message }));
  }

  public sendSpawn(message: any) {
    this.ws.send(JSON.stringify({ spawn: message }));
  }

  public sendUpdate(message: any) {
    this.ws.send(JSON.stringify({ update: message }));
  }

  public sendAppend(message: any) {
    this.ws.send(JSON.stringify({ append: message }));
  }

  public requestState() {
    this.ws.send(JSON.stringify({ request: 'getState' }));
  }

  public sendQuery(query: string): Promise<any> {
    // console.log('sending query with connection state:', this.ws.readyState);
    return new Promise((resolve, reject) => {
      this.awaited = {
        query,
        timeout: setTimeout(() => {
          console.log('query timeout');
          reject('timeout');
        }, 15000),
        resolve,
        reject
      };
      this.ws.send(JSON.stringify({ query }));
    });
  }

  public getDevice() {
    return new Promise((resolve, reject) => {
      this.awaited = {
        query: 'getDevice',
        timeout: setTimeout(() => {
          console.log('getDevice timeout');
          reject('timeout');
        }, 15000),
        resolve,
        reject
      };
      this.ws.send(JSON.stringify({ request: 'getDevice' }));
    });
  }

  public close() {
    // console.log('closing ws externally');
    if (!this.ws) {
      console.log('ws not open, cannot close');
      return;
    }
    this.ws.close();
  }

  public getWebsocketState() {
    return this.ws?.readyState || WebSocket.CLOSED;
  }
}
