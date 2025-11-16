import { Text } from "react-native";
import { HidInputConfig } from "./HidInputs";
import { useEffect, useState } from "react";
import { Button, List, Modal, Portal } from "react-native-paper";
import { InputActionConfig, InputActions } from "./InputActions";
import { View } from "react-native";

export function InputAssign({
  inputCfg,
  commitInputAssignment,
}: {
  inputCfg: HidInputConfig | null;
  commitInputAssignment: (cfg: HidInputConfig | null, action: InputActionConfig | null) => void;
}) {
  const [inputActions, setInputActions] = useState<InputActionConfig[]>([]);
  const [selectedAction, setSelectedAction] = useState<InputActionConfig | null>(null);
  useEffect(() => {
    if (!inputCfg) {
      return;
    }
    const actions = InputActions.filter(a => a.analog === inputCfg.analog);
    setInputActions(actions);
    setSelectedAction(inputCfg.action || null);
    return () => {
      // Cleanup logic here
      console.log("InputAssign unmounted");
    };
  }, [inputCfg]);
  return (
    <Portal>
      <Modal
        contentContainerStyle={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          width: '50%',
          height: '50%',
          alignSelf: 'center', // Centers the black box horizontally within the full-screen wrapper
          justifyContent: 'center', // Centers children (Text/Button) vertically inside the black box
          alignItems: 'center', // Centers children horizontally inside the black box
          padding: 20, // Optional: Inner padding for content spacing
        }}
        style={{ padding: 10, flexDirection: 'column' }}
        visible={inputCfg !== null} onDismiss={() => { }}>
        <Text style={{ color: 'white', width: '100%', fontSize: 32, borderBottomWidth: 1, borderBottomColor: 'white' }}>Assign [{inputCfg?.description}]</Text>
        <View style={{ flex: 1, width: '100%', marginTop: 20, marginBottom: 20 }}>
          {inputActions.map(action => (
            <Text key={action.type}
              onPress={() => {
                setSelectedAction(action);
                if (inputCfg) {
                  inputCfg.action = action;
                }
              }}
              style={{
                color: 'white',
                fontSize: 16,
                height: 38,
                padding: 8,
                width: '100%',
                backgroundColor: selectedAction?.type === action.type ? 'rgba(255,255,255,0.3)' : 'transparent',
              }} >
              {action.description}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Button mode="contained" style={{ width: 100 }} onPress={() =>
            commitInputAssignment(inputCfg!, selectedAction)}>
            OK
          </Button>
          <Button mode="outlined" style={{ width: 100 }} onPress={() => {
            commitInputAssignment(null, null);
          }}>
            Cancel
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}