import { NativeEventEmitter, NativeModules } from 'react-native';
import { delay } from '../util/cf';
const { UsbHid } = NativeModules;
// const eventEmitter = new NativeEventEmitter(UsbHid);
let rawData = Array<number>(16).fill(0);
// let listener: any = null;

let dataHandler: ((data: number[]) => void) | null = null;
export function setHidDataHandler(handler: (data: Array<number>) => void) {
  dataHandler = handler;
}

export function clearHidDataHandler() {
  dataHandler = null;
}

let connected = false;
let intervalId: any = null;
const DEVICE_VID = 14124; // Example: Samsung
const DEVICE_PID = 258;   // Example: Galaxy Tab S3
export async function startHidMonitoring() {
  const deviceList = await UsbHid.getAllDevices();
  console.log('Available USB devices:', deviceList);
  try {
    const hasPermission = await UsbHid.requestPermission(DEVICE_VID, DEVICE_PID);
    if (!hasPermission) {
      await UsbHid.requestPermission(DEVICE_VID, DEVICE_PID);
      console.log('Permission requested for device');
      let secondsToWait = 65;
      while (secondsToWait > 0) {
        await delay(1000);
        const granted = await UsbHid.hasPermission(DEVICE_VID, DEVICE_PID);
        if (granted) {
          console.log('Permission granted for device');
          break;
        }
        console.log(`Waiting for permission... ${secondsToWait} seconds left`);
        secondsToWait--;
      }
    }
    // listener = eventEmitter.addListener('onUsbHidData', (data) => {
    //   console.log('HID Data Received:', data);
    // });
    await UsbHid.connect(DEVICE_VID, DEVICE_PID, 2);
    //await UsbHid.startReading();
    intervalId = setInterval(async () => {
      try {
        rawData = await UsbHid.read();
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i] > 127) {
            rawData[i] = rawData[i] - 256;
          }
        }
        if (dataHandler) {
          dataHandler(rawData);
        }
      } catch (readError) {
        console.error('Error reading HID data:', readError);
      }
    }, 50); // Poll every 50ms
    connected = true;
    console.log('HID monitoring started');
  } catch (error) {
    console.error('Error starting HID monitoring:', error);
  }
}



export async function stopHidMonitoring() {
  // if (listener) {
  //   listener.remove();
  //   listener = null;
  // }
  if (!connected) return;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  // await UsbHid.stopReading();
  await UsbHid.disconnect();
  connected = false;
  console.log('HID monitoring stopped');
}