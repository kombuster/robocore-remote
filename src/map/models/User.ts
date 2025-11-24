import { OrgOwnedModel } from "./BaseModel";

export enum UserRole {
  SystemAdmin = "system_admin",
  OrgAdmin = "org_admin",
  Developer = "developer",
  Operator = "operator",
  Robot = "robot",
}

export interface User extends OrgOwnedModel {
  name: string;
  userId: string; //azure user id
  email: string;
  role: UserRole;
  tenantEmail: string;
  tempPassword?: string;
  preferences?: {
    navbarCollapsed: boolean;
    recentSceneId?: string;
  };
}

export function createUser(_id = ''): User {
  return {
    _id,
    orgId: "",
    name: "",
    userId: "",
    email: "",
    role: UserRole.Operator,
    tenantEmail: "",
  };
}
