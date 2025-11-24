export interface BaseModel {
  _id: string;
}

export interface OrgOwnedModel extends BaseModel {
  orgId: string;
}
