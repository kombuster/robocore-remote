import { useEffect, useState } from "react";
import { clearHidDataHandler, setHidDataHandler, startHidMonitoring, stopHidMonitoring } from "./monitor";
import { Button, DataTable, ProgressBar } from "react-native-paper";
import { StyleSheet, ScrollView } from "react-native";
import { HidInputConfig, HidInputConfigs, saveInputSettings } from "./HidInputs";
import { InputAssign } from "./InputAssign";
import { InputActionConfig } from "./InputActions";

export function HidView() {
  const [hidData, setHidData] = useState<number[]>(Array(16).fill(0));
  const [editedInput, setEditedInput] = useState<HidInputConfig | null>(null);
  const [inputs, setInputs] = useState<HidInputConfig[]>(HidInputConfigs);
  useEffect(() => {
    // Any setup can go here
    setHidDataHandler((data: number[]) => {
      setHidData(data);
    });
    console.log("HidView mounted");
    return () => {
      // Any cleanup can go here
      clearHidDataHandler();
    };
  }, []);
  const styles = StyleSheet.create({
    button: {
      marginBottom: 10,
    },
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: '#222222',
      padding: 10,
    }
  });
  const indicatorValue = (cfg: HidInputConfig) => {
    const val = cfg.value(hidData);
    if (cfg.analog) {
      return (val + 127) / 255;
    } else {
      return val === 0 ? 0 : 254;
    }
  }
  const commitInputAssignment = async (cfg: HidInputConfig | null, action: InputActionConfig | null) => {
    // console.log("Assigned input:", enumName(HidInputConfig, cfg.type));
    setEditedInput(null);
    if (cfg && action) {
      for (const inputCfg of inputs) {
        if (inputCfg.action && inputCfg.action.type === action.type) {
          inputCfg.action = undefined;
        }
      }
      cfg.action = action;
      action.input = cfg;
    }
    await saveInputSettings();
    setInputs([...inputs]);
  };
  return (
    <ScrollView style={styles.container}  >
      <DataTable>
        <DataTable.Header style={{ borderBottomColor: 'white', height: 64, borderBottomWidth: 2, marginBottom: 5 }} >
          <DataTable.Title style={{ alignItems: 'flex-end' }} textStyle={{ color: 'white', fontSize: 16 }} >Input</DataTable.Title>
          <DataTable.Title style={{ alignItems: 'flex-end' }} textStyle={{ color: 'white', fontSize: 16 }} >Mapping</DataTable.Title>
          <DataTable.Title style={{ alignItems: 'flex-end' }} textStyle={{ color: 'white', fontSize: 16 }} >.</DataTable.Title>
        </DataTable.Header>

        {inputs.map((inputConfig, index) => (
          <DataTable.Row style={{ minHeight: 32 }} key={index}>
            <DataTable.Cell textStyle={{ color: 'white', fontSize: 16 }} >{inputConfig.description}</DataTable.Cell>
            <DataTable.Cell onPress={() => setEditedInput(inputConfig)} style={{
              justifyContent: 'flex-start',
              paddingLeft: 10,
              backgroundColor: inputConfig.action ? 'blue' : 'green'
            }} textStyle={{ color: 'white', fontSize: 16 }} >
              {inputConfig.action ? inputConfig.action.description : ''}
            </DataTable.Cell>
            <DataTable.Cell style={{ justifyContent: 'flex-end' }} >
              <ProgressBar style={{ height: 16, width: 150 }} color="blue" progress={
                indicatorValue(inputConfig)
              } />
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
      <InputAssign inputCfg={editedInput} commitInputAssignment={commitInputAssignment} />
    </ScrollView>
  );
}