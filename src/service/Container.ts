import {KoaService} from "./KoaService";
import * as pino from "pino";
import {Context} from "koa";
import {JPController} from "./controller/jp/JPController";
import {Storage} from "../fare/Storage";
import {OrderController} from "./controller/order/OrderController";
import axios from "axios";
import * as NodeRSA from "node-rsa";
import * as fs from "fs";
import {EthereumSignatureProvider} from "../signature/EthereumSignatureProvider";
import * as memoize from "memoized-class-decorator";
import {config} from "../../config/retail/config";
const Web3 = require("web3");

export class Container {
  
  public async getKoaService(): Promise<KoaService> {
    return new KoaService(
      8000,
      this.getLogger(),
      "traintickets.to",
      {
        filter: (ctx: Context) => ctx.request.path === "/jp",
        port: 443,
        https: true,
        limit: "5mb",
        userResDecorator: this.getJPController().get
      },
      {
        "POST": {
          "/order": this.getOrderController().post
        }
      }
    );
  }

  @memoize
  public getOrderController(): OrderController {
    return new OrderController(
      axios.create({
        baseURL: "https://railsmartr.stage.assertis.co.uk/",
        headers: {
          "X-Tenant": "rsm"
        },
      }),
      new NodeRSA(fs.readFileSync("./config/awt/private.key")),
      this.getStorage(),
      this.getEthereumSignatureProvider()
    );
  }

  @memoize
  public getStorage(): Storage {
    return new Storage({});
  }

  @memoize
  public getJPController(): JPController {
    return new JPController(this.getStorage());
  }

  @memoize
  public getLogger(): pino.Logger {
    return pino({ prettyPrint: true, level: "debug" });
  }

  @memoize
  public getEthereumSignatureProvider(): EthereumSignatureProvider {
    const provider = new Web3.providers.HttpProvider(config.infura);
    const web3 = new Web3(provider);

    return new EthereumSignatureProvider(
      web3.eth.accounts.privateKeyToAccount(config.privateKey) as any,
      web3.utils,
      this.getLogger()
    );
  }

}
