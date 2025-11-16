import { MapChannel } from "./MapChannel";

export class CostmapChannel extends MapChannel {
  constructor() {
    super();
  }


  public getConfiguration() {
    return {
      name: 'costmap'
    };
  }

  protected renderMap(): void {
    const map = this.lastReceivedMap
    if (!map) return;
    // this.actor.costmap.update(map);
  }
}
