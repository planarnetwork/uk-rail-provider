
import {JourneyPlanStorage} from "../../../order/JourneyPlanStorage";
import autobind from "autobind-decorator";

@autobind
export class JPController {

  constructor(
    private readonly storage: JourneyPlanStorage
  ) {}

  public get(proxyRes: any, proxyResData: any): string {
    const data: JourneyPlannerResponse = JSON.parse(proxyResData.toString("utf8"));

    Object.keys(data.links)
      .filter(id => id.startsWith("/fare-option/"))
      .map(id => [id, data.links[id]])
      .concat(data.data.outward.map(item => [item.id, item]))
      .concat(data.data.inward.map(item => [item.id, item]))
      .forEach(([id, item]) => this.storage.store(id, item, data.links));

    return JSON.stringify(data);
  }

}

interface JourneyPlannerResponse {
  links: Links,
  data: {
    outward: Journey[],
    inward: Journey[],
    fares: SingleFares | ReturnFares
  }
}

type Journey = any;

interface SingleFares {
  [inwardJourneyId: string]: string[];
}

interface ReturnFares {
  [outwardJourneyId: string]: SingleFares;
}

export interface Links {
  [id: string]: any;
}
