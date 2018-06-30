
import {Logger} from "pino";
import * as Koa from "koa";
import proxy = require("koa-better-http-proxy");
import {Context} from "koa";
import {isArray} from "util";
import {Storage} from "../fare/Storage";

export class KoaService {

  constructor(
    private readonly koaPort: number,
    private readonly logger: Logger,
    private readonly journeyPlannerConfig: JourneyPlannerConfig,
    private readonly storage: Storage
  ) {}

  /**
   * Start the koa server
   */
  public async start(): Promise<void> {
    const app = new Koa();

    app.use(proxy(this.journeyPlannerConfig.url, {
      filter: (ctx: Context) => ctx.request.path === "/jp",
      port: this.journeyPlannerConfig.port,
      https: this.journeyPlannerConfig.port === 443,
      limit: "5mb",
      userResDecorator: this.responseHandler.bind(this)
    }));

    app.listen(this.koaPort);

    this.logger.info(`Started on ${this.koaPort}`);
  }

  private async responseHandler(proxyRes: any, proxyResData: any): Promise<any> {
    const data: JourneyPlannerResponse = JSON.parse(proxyResData.toString("utf8"));

    Object.keys(data.links)
      .filter(id => id.startsWith("/fare-option/") || id.startsWith("/journey/"))
      .forEach(id => this.storage.store(id, data.links));

    return JSON.stringify(data);
  }

}

export interface JourneyPlannerConfig {
  url: string;
  port: number;
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
