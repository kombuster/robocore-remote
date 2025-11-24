import { BaseModel } from "./BaseModel";

export interface Org extends BaseModel {
  name: string;
  description: string;
  token: string;
}

export function createOrg(_id = ''): Org {
  return {
    _id,
    name: "",
    description: "",
    token: "1234567890",
  };
}