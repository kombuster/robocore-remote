import { OrgOwnedModel } from "./BaseModel";

export interface RemoteControl extends OrgOwnedModel {
  name: string;
  yamlContent: string;
  token: string;
  robotId: string;
}

export function createRemoteControl(_id = ''): RemoteControl {
  return {
    _id: _id,
    orgId: "",
    name: "",
    yamlContent: "",
    token: "",
    robotId: "",
  };
}