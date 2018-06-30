import {KoaService} from "./KoaService";
import * as pino from "pino";
import {FareStorage} from "../fare/FareStorage";

export class Container {

  public async getKoaService(): Promise<KoaService> {
    return new KoaService(
      8002,
      pino({ prettyPrint: true }),
      {
        url: "traintickets.to",
        port: 443
      },
      new FareStorage({})
    );
  }

}