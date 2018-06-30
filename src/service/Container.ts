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
    const jpController = new JPController(new Storage({}));
    const orderController = new OrderController(
      axios.create({
        baseURL: "https://hex.test.assertis.co.uk/",
        headers: {
          "X-Tenant": "hex"
        },
      }),
      new NodeRSA(fs.readFileSync("./config/awt/private.key"))
    );

    return new KoaService(
      8002,
      pino({ prettyPrint: true }),
      "traintickets.to",
      {
        filter: (ctx: Context) => ctx.request.path === "/jp",
        port: 443,
        https: true,
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