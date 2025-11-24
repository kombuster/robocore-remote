import { OrgOwnedModel } from "./BaseModel";
import { Vec2 } from "./SyntheticMap";

export interface ScenarioBlockOutput {
  condition: string; // The condition that triggers this output
  blockId: string; // The ID of the block that this output connects to
}

export interface ScenarioBlock {
  id: string;
  actorId: string;
  type: string; // Type of the block (e.g., "reset")
  text: string;
  isBuilt: boolean;
  outputs: ScenarioBlockOutput[];
  position: Vec2; // Position of the block in the scenario
}

export interface Scenario extends OrgOwnedModel {
  name: string; // Name of the scenario
  blocks: ScenarioBlock[]; // List of blocks in the scenario
  siteId: string; // ID of the site the scenario is associated with
}

export function createScenario(_id = ''): Scenario {
  return {
    _id,
    name: 'New Scenario',
    blocks: [],
    siteId: '',
    orgId: '',
  };
}
