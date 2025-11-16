package com.tangenta.robocoreremote  // Ensure file is in android/app/src/main/java/com/tmhmi/usb/

import android.content.Context
import android.hardware.usb.UsbConstants
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbDeviceConnection
import android.hardware.usb.UsbEndpoint
import android.hardware.usb.UsbInterface
import android.hardware.usb.UsbManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.WritableMap
import android.util.Log
import android.app.PendingIntent
import android.content.Intent

class UsbHidModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var connection: UsbDeviceConnection? = null
    private var hidInterface: UsbInterface? = null  // Store for release
    private var endpointIn: UsbEndpoint? = null
    private var running = false

    override fun getName(): String = "UsbHid"

    @ReactMethod
    fun requestPermission(vid: Int, pid: Int, promise: Promise) {
        val manager = reactApplicationContext.getSystemService(Context.USB_SERVICE) as UsbManager
        val device = manager.deviceList.values.find { it.vendorId == vid && it.productId == pid }
        if (device == null) {
            promise.reject("NO_DEVICE", "Device not found")
            return
        }
        // Create pending intent for broadcast (handles grant/deny)
        val intent = Intent("com.tmhmi.USB_PERMISSION")  // Custom action
        val pendingIntent = PendingIntent.getBroadcast(reactApplicationContext, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        manager.requestPermission(device, pendingIntent)
        // Listen for result via BroadcastReceiver (register in your activity/service)
        // In receiver: if granted, proceed to connect(); else reject promise
        promise.resolve("Prompt shown")
    }

    @ReactMethod
    fun hasPermission(vid: Int, pid: Int, promise: Promise) {
        val manager = reactApplicationContext.getSystemService(Context.USB_SERVICE) as UsbManager
        val device = manager.deviceList.values.find { it.vendorId == vid && it.productId == pid }
        if (device == null) {
            promise.reject("NO_DEVICE", "Device not found")
            return
        }
        val hasPerm = manager.hasPermission(device)
        promise.resolve(hasPerm)
    }

    @ReactMethod
    fun getAllDevices(promise: Promise) {
        val manager = reactApplicationContext.getSystemService(Context.USB_SERVICE) as UsbManager
        val deviceList = manager.deviceList
        Log.d("USB", "Available USB devices count: ${deviceList.size}")
        val devicesArray: WritableArray = Arguments.createArray()
        for ((deviceName, device: UsbDevice) in deviceList) {
            val deviceMap: WritableMap = Arguments.createMap()
            deviceMap.putString("name", deviceName)
            deviceMap.putInt("vid", device.vendorId)
            deviceMap.putInt("pid", device.productId)
            deviceMap.putInt("class", device.deviceClass)
            // Optional: Add more details if needed, e.g., interface count
            deviceMap.putInt("interfaceCount", device.interfaceCount)
            Log.d("USB", "Device: $deviceName, VID: ${device.vendorId}, PID: ${device.productId}, Class: ${device.deviceClass}")
            devicesArray.pushMap(deviceMap)
        }
        promise.resolve(devicesArray)
    }

    @ReactMethod
    fun connect(vid: Int, pid: Int, iface: Int, promise: Promise) {
        val manager = reactApplicationContext.getSystemService(Context.USB_SERVICE) as UsbManager
        val deviceList = manager.deviceList
        Log.d("USB", "Available USB devices count: ${deviceList.size}")
        for ((deviceName, device: UsbDevice) in deviceList) {
            Log.d("USB", "Device: $deviceName, VID: ${device.vendorId}, PID: ${device.productId}, Class: ${device.deviceClass}")
        }        
        val device: UsbDevice? = manager.deviceList.values.find { it.vendorId == vid && it.productId == pid }
        if (device == null) {
            promise.reject("NO_DEVICE", "HID device not found")
            return
        }
        if (!manager.hasPermission(device)) {
            promise.reject("NO_PERMISSION", "USB permission denied")
            return
        }
        connection = manager.openDevice(device)

        hidInterface = device.getInterface(iface).takeIf { it.interfaceClass == UsbConstants.USB_CLASS_HID }
        if (hidInterface == null || connection?.claimInterface(hidInterface, true) != true) {
            promise.reject("CLAIM_FAILED", "Failed to claim HID interface")
            return
        }
        // Find interrupt IN endpoint using loop (no endpointList)
        endpointIn = null
        for (i in 0 until hidInterface!!.endpointCount) {
            val ep: UsbEndpoint = hidInterface!!.getEndpoint(i)
            if (ep.type == UsbConstants.USB_ENDPOINT_XFER_INT && ep.direction == UsbConstants.USB_DIR_IN) {
                endpointIn = ep
                break
            }
        }
        if (endpointIn == null) {
            promise.reject("NO_ENDPOINT", "No input endpoint found")
            return
        }
        promise.resolve("Connected")
    }

    @ReactMethod
    fun read(promise: Promise) {
        if (endpointIn == null) {
            promise.reject("INVALID_STATE", "Not connected")
            return
        }
        val buffer = ByteArray(endpointIn!!.maxPacketSize)
        val bytesRead = connection?.bulkTransfer(endpointIn!!, buffer, buffer.size, 1000) ?: -1
        val result = Arguments.createArray()
        if (bytesRead > 0) {
            for (b in buffer.sliceArray(0 until bytesRead)) {
                result.pushInt(b.toInt() and 0xFF)
            }
        }
        promise.resolve(result)
    }

    @ReactMethod
    fun startReading(promise: Promise) {
        if (endpointIn == null || running) {
            promise.reject("INVALID_STATE", "Not connected or already reading")
            return
        }
        running = true
        val buffer = ByteArray(endpointIn!!.maxPacketSize)
        Thread {
            while (running) {
                val bytesRead = connection?.bulkTransfer(endpointIn!!, buffer, buffer.size, 1000) ?: -1
                if (bytesRead > 0) {
                    val result = Arguments.createArray()
                    for (b in buffer.sliceArray(0 until bytesRead)) {
                        result.pushInt(b.toInt() and 0xFF)
                    }
                    reactApplicationContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onHidData", result)
                } else if (bytesRead < 0) {
                    // TODO: Add error logging or emit error event
                }
                try {
                    Thread.sleep(1000)  // Poll rate; adjust for your needs
                } catch (e: InterruptedException) {
                    running = false
                }
            }
        }.start()
        promise.resolve("Started reading")
    }

    @ReactMethod
    fun stopReading(promise: Promise) {
        running = false
        promise.resolve("Stopped")
    }

    @ReactMethod
    fun disconnect(promise: Promise) {
        running = false
        hidInterface?.let { interfaceToRelease ->
            connection?.releaseInterface(interfaceToRelease)
        }
        connection?.close()
        connection = null
        hidInterface = null
        endpointIn = null
        promise.resolve("Disconnected")
    }
}