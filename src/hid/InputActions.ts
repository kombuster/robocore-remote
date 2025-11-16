import { HidInputConfig } from "./HidInputs";

export enum InputAction {
  STEP_FORWARD_BACK = 0,
  TURN_LEFT_RIGHT = 1,
  STEP_LEFT_RIGHT = 2,
  PITCH_UP_DOWN = 3,
  SWITCH_POSTURE = 4,
  SWITCH_NAVMODE = 5,
  LIGHTS_TOGGLE = 6,
  TOGGLE_SCREEN_LAYOUT = 7,
}

export interface InputActionConfig {
  type: InputAction;
  analog?: boolean;
  description: string;
  input?: HidInputConfig;
}

export const InputActions: InputActionConfig[] = [];
InputActions[InputAction.STEP_FORWARD_BACK] = {
  type: InputAction.STEP_FORWARD_BACK,
  analog: true,
  description: "Step Forward/Back",
};
InputActions[InputAction.TURN_LEFT_RIGHT] = {
  type: InputAction.TURN_LEFT_RIGHT,
  analog: true,
  description: "Turn Left/Right",
};
InputActions[InputAction.STEP_LEFT_RIGHT] = {
  type: InputAction.STEP_LEFT_RIGHT,
  analog: true,
  description: "Step Left/Right",
};
InputActions[InputAction.PITCH_UP_DOWN] = {
  type: InputAction.PITCH_UP_DOWN,
  analog: true,
  description: "Pitch Up/Down",
};
InputActions[InputAction.SWITCH_POSTURE] = {
  type: InputAction.SWITCH_POSTURE,
  description: "Switch Posture",
};
InputActions[InputAction.SWITCH_NAVMODE] = {
  type: InputAction.SWITCH_NAVMODE,
  description: "Switch Navigation Mode",
};
InputActions[InputAction.LIGHTS_TOGGLE] = {
  type: InputAction.LIGHTS_TOGGLE,
  description: "Toggle Lights",
};
InputActions[InputAction.TOGGLE_SCREEN_LAYOUT] = {
  type: InputAction.TOGGLE_SCREEN_LAYOUT,
  description: "Toggle Screen Layout",
};