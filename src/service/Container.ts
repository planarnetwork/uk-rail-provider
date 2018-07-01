import {KoaService} from "./KoaService";
import * as pino from "pino";
import {Context} from "koa";
import {JPController} from "./controller/jp/JPController";
import {Storage} from "../fare/Storage";
import {OrderController} from "./controller/order/OrderController";
import axios from "axios";
import * as NodeRSA from "node-rsa";
import * as fs from "fs";

export class Container {

  public async getKoaService(): Promise<KoaService> {
    const storage = new Storage({});
    const jpController = new JPController(storage);
    const orderController = new OrderController(
      axios.create({
        baseURL: "https://goeuro.stage.assertis.co.uk/",
        headers: {
          "X-Tenant": "rsm"
        },
      }),
      new NodeRSA(fs.readFileSync("./config/awt/private.key")),
      storage
    );

    return new KoaService(
      8002,
      pino({ prettyPrint: true }),
      "localhost",
      {
        filter: (ctx: Context) => ctx.request.path === "/jp",
        port: 8000,
        https: false,
        limit: "5mb",
        userResDecorator: jpController.get
      },
      {
        "POST": {
          "/order": orderController.post
        }
      }
    );
  }

}