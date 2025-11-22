import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { defaultRCRobocoreConfig, RobocoreConfig } from '../robocore/robocore-config';
import { useEffect, useState } from 'react';
import { CameraView } from 'expo-camera';
import { SyncConnection } from './SyncConnection';
export function Sync() {
  const [syncConfig, setSyncConfig] = useState<RobocoreConfig>(defaultRCRobocoreConfig);
  const [syncConnection, setSyncConnection] = useState(new SyncConnection());
  const [qrScanOpen, setQrScanOpen] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    const loadConfig = async () => {
      const config = await syncConnection.loadConfig();
      setSyncConfig(config);
    };
    loadConfig();
  }, []);
  return (
    <View style={styles.container}>
      <View style={
        { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }
      }>
        <Text style={styles.titleText}>TECHMAGE SYNC</Text>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '50%', justifyContent: 'center', alignItems: 'center' }}>
          {qrScanOpen &&
            <CameraView
              style={{ width: '100%', height: '100%' }}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'], // Can add more like 'ean13', 'code128', etc.
              }}
              onBarcodeScanned={async ({ data }) => {
                try {
                  setQrScanOpen(false);
                  console.log('Scanned QR data:', data); // Handle the data (e.g., alert, navigate, or process)
                  const [deviceId, token, baseUrl] = data.split('|');
                  setSyncConfig({ deviceId, token, baseUrl });
                  await syncConnection.saveConfig({ deviceId, token, baseUrl });
                } catch (error) {
                  console.error('Error processing scanned QR code:', error);
                }
                // Optional: Reset scanned after handling: setTimeout(() => setScanned(false), 3000);
              }}
            />
          }
        </View>
        <View style={{ flex: 1, marginRight: 10 }}>
          <TextInput
            value={syncConfig.deviceId}
            onChangeText={(text) => setSyncConfig({ ...syncConfig, deviceId: text })}
            label="Device ID"
            mode="outlined"
            textColor='white'
            style={styles.textFieldStyle}
          />
          <TextInput
            value={syncConfig.token}
            onChangeText={(text) => setSyncConfig({ ...syncConfig, token: text })}
            label="Token"
            mode="outlined"
            textColor='white'
            style={styles.textFieldStyle}
          />
          <TextInput
            value={syncConfig.baseUrl}
            onChangeText={(text) => setSyncConfig({ ...syncConfig, baseUrl: text })}
            label="Signaling URL"
            mode="outlined"
            textColor='white'
            style={styles.textFieldStyle}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 }} >
            <Button disabled={status !== ''} mode="contained" onPress={() => {
              setQrScanOpen(!qrScanOpen);
            }}>
              SCAN QR
            </Button>
            <Button disabled={status !== ''} mode="contained" onPress={() => {
              syncConnection.saveConfig(syncConfig);
            }}>
              SAVE
            </Button>
            <Button mode="contained" disabled={status !== ''} onPress={async () => {
              await syncConnection.runSync((newStatus) => setStatus(newStatus));
            }}>
              SYNC NOW
            </Button>
          </View>
          <Text style={{ color: 'white', marginTop: 10 }}>{status}</Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  menuButton: {
    width: '100%',
    justifyContent: 'flex-start',
    height: 50,
  },
  titleText: {
    fontSize: 40,
    color: 'white',
    textAlign: 'left',  // Left-aligns the text
    flex: 1,  // Allows text to take full available space      
  },
  container: {
    flex: 1,
    padding: 20,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  textFieldStyle: {
    backgroundColor: 'black',
    color: 'white',
    marginBottom: 10,
  },
});
