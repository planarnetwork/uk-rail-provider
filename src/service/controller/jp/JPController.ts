
import {Storage} from "../../../fare/Storage";
import autobind from "autobind-decorator";

@autobind
export class JPController {

  constructor(
    private readonly storage: Storage
  ) {}

  public get(proxyRes: any, proxyResData: any): string {
    const data: JourneyPlannerResponse = JSON.parse(proxyResData.toString("utf8"));

    Object.keys(data.links)
      .filter(id => id.startsWith("/fare-option/") || id.startsWith("/journey/"))
      .forEach(id => this.storage.store(id, data.links));

    return JSON.stringify(data);
  }

}

interface JourneyPlannerResponse {
  links: Links,
  response: {
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
