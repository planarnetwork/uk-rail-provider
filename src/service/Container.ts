import {KoaService} from "./KoaService";
import * as pino from "pino";
import {Context} from "koa";
import {JPController} from "./controller/jp/JPController";
import {Storage} from "../fare/Storage";
import {OrderController} from "./controller/order/OrderController";
import axios from "axios";
import * as NodeRSA from "node-rsa";
import * as fs from "fs";
import Web3 = require("web3");

export class Container {

  public async getKoaService(): Promise<KoaService> {
    const storage = new Storage({});
    const jpController = new JPController(storage);

    // const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    //
    // web3.personal.unlockAccount(web3.personal.listAccounts[0],fs.readFileSync("./config/retail/account.key"), 1000);

    const orderController = new OrderController(
      axios.create({
        baseURL: "https://railsmartr.stage.assertis.co.uk/",
        headers: {
          "X-Tenant": "rsm"
        },
      }),
      new NodeRSA(fs.readFileSync("./config/awt/private.key")),
      storage
    );

    return new KoaService(
      8000,
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