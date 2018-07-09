import {KoaService} from "./KoaService";
import * as pino from "pino";
import {Context} from "koa";
import {JPController} from "./controller/jp/JPController";
import {Storage} from "../fare/Storage";
import {OrderController} from "./controller/order/OrderController";
import axios from "axios";
import * as NodeRSA from "node-rsa";
import * as fs from "fs";
import * as memoize from "memoized-class-decorator";
import {config} from "../../config/retail/config";
import {CurrencyExchange} from "../currency/CurrencyExchange";
import {SignatureProvider} from "../signature/SignatureProvider";
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
      this.getSignatureProvider(),
      this.getCurrencyExchange()
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
  public getSignatureProvider(): SignatureProvider {
    return new SignatureProvider(
      this.getWeb3().eth.accounts.privateKeyToAccount(config.privateKey) as any,
      this.getWeb3().utils,
      this.getLogger()
    );
  }

  @memoize
  public getWeb3() {
    const provider = new Web3.providers.HttpProvider(config.infura);

    return new Web3(provider);
  }

  @memoize
  public getCurrencyExchange(): CurrencyExchange {
    return new CurrencyExchange(
      axios.create({ baseURL: "https://min-api.cryptocompare.com/" }),
      this.getWeb3().utils
    )
  }

}
