
import {Logger} from "pino";
import * as Koa from "koa";
import * as cors from "@koa/cors";
import * as proxy from "koa-better-http-proxy";
import * as bodyParser from "koa-bodyparser";
import {Context} from "koa";
import {isArray} from "util";
import autobind from "autobind-decorator";

@autobind
export class KoaService {

  constructor(
    private readonly koaPort: number,
    private readonly logger: Logger,
    private readonly journeyPlannerUrl: string,
    private readonly proxyConfig: proxy.IOptions,
    private readonly routes: Routes
  ) {}

  /**
   * Start the koa server
   */
  public async start(): Promise<void> {
    const app = new Koa();

    app.use(cors({ origin: "*" }));
    app.use(this.errorHandler);
    app.use(this.requestLogger);
    app.use(proxy(this.journeyPlannerUrl, this.proxyConfig));
    app.use(bodyParser());
    app.use(this.handler);

    app.listen(this.koaPort);

    this.logger.info(`Started on ${this.koaPort}`);
  }

  /**
   * Log the request info and response time
   */
  private async requestLogger(ctx: Context, next: any) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;

    this.logger.info(`${ctx.method} ${ctx.url} - ${ms}`);
    ctx.set("X-Response-Time", `${ms}ms`);
  }

  /**
   * Process requests if they have a handler
   */
  private async handler(ctx: Context, next: () => void) {
    if (this.routes[ctx.request.method] && this.routes[ctx.request.method][ctx.request.path]) {
      return this.routes[ctx.request.method][ctx.request.path](ctx);
    }

    return next();
  }

  /**
   * Standard Koa error handling
   */
  private async errorHandler(ctx: Context, next: () => void): Promise<void> {
    try {
      await next();
    }
    catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
      ctx.app.emit("error", err, ctx);
    }
  }

}

interface Routes {
  [method: string]: {
    [url: string]: (ctx: Context) => any
  }
}
