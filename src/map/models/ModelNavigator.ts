import { createAsset } from "./Asset";
import { BaseModel } from "./BaseModel";
import { createDeployment } from "./Deployment";
import { createModel } from "./Model";
import { createOrg } from "./Org";
import { createOrgBlob } from "./OrgBlob";
import { createRemoteControl } from "./RemoteControl";
import { createRobot } from "./Robot";
import { createScenario } from "./Scenario";
import { createSite } from "./Site";
import { createSiteAnchor } from "./SiteAnchor";
import { createSyntheticMap } from "./SyntheticMap";
import { createUser } from "./User";

function getSignature(model: BaseModel): string {
  // append names of object properties to a string
  const signature = Object.keys(model).join("_");
  return signature;
}

const singatureToCollectionName = new Map<string, string>([
  [getSignature(createUser()), "users"],
  [getSignature(createSyntheticMap()), "maps"],
  [getSignature(createRobot()), "robots"],
  [getSignature(createSite()), "sites"],
  [getSignature(createAsset()), "assets"],
  [getSignature(createDeployment()), "deployments"],
  [getSignature(createOrg()), "organizations"],
  [getSignature(createSiteAnchor()), "siteanchors"],
  [getSignature(createModel()), "models"],
  [getSignature(createOrgBlob()), "orgblobs"],
  [getSignature(createScenario()), "scenarios"],
  [getSignature(createRemoteControl()), "remotecontrols"],
]);

export function getCollectionName(model: BaseModel): string {
  const keys = Object.keys(model);

  if (keys.includes("cameraPose") && keys.includes("robots")) {
    return "maps";
  }

  // Fallback to signature-based match
  const signature = keys.join("_");
  const collectionName = singatureToCollectionName.get(signature);

  if (!collectionName) {
    console.error("Unmapped Signature:", signature);
    console.error("Available Mappings:", Array.from(singatureToCollectionName.keys()));
    throw new Error(`No collection name found for signature: ${signature}`);
  }
  return collectionName;
}
