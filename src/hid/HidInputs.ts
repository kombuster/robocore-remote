import AsyncStorage from "@react-native-async-storage/async-storage";
import { HidChannels } from "./HidChannels";
import { InputAction, InputActionConfig, InputActions } from "./InputActions";

export interface HidInputConfig {
  type: HidInput;
  value: (input: number[]) => number;
  description: string;
  analog?: boolean;
  action?: InputActionConfig
}

export enum HidInput {
  RIGHT_STICK_Y = 0,
  RIGHT_STICK_X = 1,
  RIGHT_TRIGGER_X = 2,
  LEFT_STICK_X = 3,
  LEFT_STICK_Y = 4,
  LEFT_TRIGGER_X = 5,
  TOP_BUTTON_1 = 6,
  TOP_BUTTON_2 = 7,
  TOP_BUTTON_3 = 8,
  TOP_BUTTON_4 = 9,
  BUTTON_Y = 10,
  BUTTON_A = 11,
  BUTTON_B = 12,
  BUTTON_X = 13,
  TRIGGER_L = 14,
  TRIGGER_R = 15,
  BUTTON_UP = 16,
  BUTTON_RIGHT = 17,
  BUTTON_DOWN = 18,
  BUTTON_LEFT = 19,
}

export const HidInputConfigs: HidInputConfig[] = [];
HidInputConfigs[HidInput.RIGHT_STICK_Y] = {
  type: HidInput.RIGHT_STICK_Y,
  description: "Right Stick Y Axis",
  value: (input: number[]) => input[HidChannels.RIGHT_STICK_Y],
  analog: true,
};
HidInputConfigs[HidInput.RIGHT_STICK_X] = {
  type: HidInput.RIGHT_STICK_X,
  description: "Right Stick X Axis",
  value: (input: number[]) => input[HidChannels.RIGHT_STICK_X],
  analog: true,
};
HidInputConfigs[HidInput.RIGHT_TRIGGER_X] = {
  type: HidInput.RIGHT_TRIGGER_X,
  description: "Right Trigger",
  value: (input: number[]) => input[HidChannels.RIGHT_TRIGGER_X],
  analog: true,
};
HidInputConfigs[HidInput.LEFT_STICK_X] = {
  type: HidInput.LEFT_STICK_X,
  description: "Left Stick X Axis",
  value: (input: number[]) => input[HidChannels.LEFT_STICK_X],
  analog: true,
};
HidInputConfigs[HidInput.LEFT_STICK_Y] = {
  type: HidInput.LEFT_STICK_Y,
  description: "Left Stick Y Axis",
  value: (input: number[]) => input[HidChannels.LEFT_STICK_Y],
  analog: true,
};
HidInputConfigs[HidInput.LEFT_TRIGGER_X] = {
  type: HidInput.LEFT_TRIGGER_X,
  description: "Left Trigger",
  value: (input: number[]) => input[HidChannels.LEFT_TRIGGER_X],
  analog: true,
};
HidInputConfigs[HidInput.TOP_BUTTON_1] = {
  type: HidInput.TOP_BUTTON_1,
  description: "Top Button 1",
  value: (input: number[]) => (input[HidChannels.BUTTON_PAD_EXTRA] & 4) !== 0 ? 1 : 0,
};
HidInputConfigs[HidInput.TOP_BUTTON_2] = {
  type: HidInput.TOP_BUTTON_2,
  description: "Top Button 2",
  value: (input: number[]) => (input[HidChannels.BUTTON_PAD_EXTRA] & 16) !== 0 ? 1 : 0,
};
HidInputConfigs[HidInput.TOP_BUTTON_3] = {
  type: HidInput.TOP_BUTTON_3,
  description: "Top Button 3",
  value: (input: number[]) => (input[HidChannels.BUTTON_PAD] & 32) !== 0 ? 1 : 0,
};
HidInputConfigs[HidInput.TOP_BUTTON_4] = {
  type: HidInput.TOP_BUTTON_4,
  description: "Top Button 4",
  value: (input: number[]) => (input[HidChannels.BUTTON_PAD] & 4) !== 0 ? 1 : 0,
};
HidInputConfigs[HidInput.BUTTON_Y] = {
  type: HidInput.BUTTON_Y,
  description: "Button Y",
  value: (input: number[]) => (input[HidChannels.BUTTON_PAD] & 16) !== 0 ? 1 : 0,
};
HidInputConfigs[HidInput.BUTTON_A] = {
  type: HidInput.BUTTON_A,
  description: "Button A",
  value: (input: number[]) => (input[HidChannels.BUTTON_PAD] & 1) !== 0 ? 1 : 0,
};
HidInputConfigs[HidInput.BUTTON_B] = {
  type: HidInput.BUTTON_B,
  description: "Button B",
  value: (input: number[]) => (input[HidChannels.BUTTON_PAD] & 2) !== 0 ? 1 : 0,
};
HidInputConfigs[HidInput.BUTTON_X] = {
  type: HidInput.BUTTON_X,
  description: "Button X",
  value: (input: number[]) => (input[HidChannels.BUTTON_PAD] & 8) !== 0 ? 1 : 0,
};
HidInputConfigs[HidInput.TRIGGER_L] = {
  type: HidInput.TRIGGER_L,
  description: "Left Trigger",
  value: (input: number[]) => (input[HidChannels.BUTTON_PAD] === 64) ? 1 : 0,
};  
HidInputConfigs[HidInput.TRIGGER_R] = {
  type: HidInput.TRIGGER_R,
  description: "Right Trigger",
  value: (input: number[]) => (input[HidChannels.BUTTON_PAD] === -128) ? 1 : 0,
};
HidInputConfigs[HidInput.BUTTON_UP] = {
  type: HidInput.BUTTON_UP,
  description: "Button Up",
  value: (input: number[]) => (input[HidChannels.DIRECTIONAL_PAD] === 0) ? 1 : 0,
};
HidInputConfigs[HidInput.BUTTON_RIGHT] = {
  type: HidInput.BUTTON_RIGHT,
  description: "Button Right",
  value: (input: number[]) => (input[HidChannels.DIRECTIONAL_PAD] === 2) ? 1 : 0,
};
HidInputConfigs[HidInput.BUTTON_DOWN] = {
  type: HidInput.BUTTON_DOWN,
  description: "Button Down",
  value: (input: number[]) => (input[HidChannels.DIRECTIONAL_PAD] === 4) ? 1 : 0,
};
HidInputConfigs[HidInput.BUTTON_LEFT] = {
  type: HidInput.BUTTON_LEFT,
  description: "Button Left",
  value: (input: number[]) => (input[HidChannels.DIRECTIONAL_PAD] === 6) ? 1 : 0,
};

export async function loadInputSettings() {
  const mappings = await AsyncStorage.getItem('user_hid_input_mappings');
  if (mappings) {
    const parsed = JSON.parse(mappings);
    for (const mapping of parsed as number[][]) {
      const cfg = HidInputConfigs[mapping[0]];
      if (cfg) {
        cfg.action = InputActions[mapping[1]];
        if (cfg.action) {
          cfg.action.input = cfg;
        }
      }
    }
  }
}

export async function saveInputSettings() {
  const mappings: number[][] = [];
  for (const cfg of HidInputConfigs) {
    if (cfg.action) {
      mappings.push([cfg.type, cfg.action.type]);
    }
  }
  await AsyncStorage.setItem('user_hid_input_mappings', JSON.stringify(mappings));
}