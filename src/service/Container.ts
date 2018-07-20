import {KoaService} from "./KoaService";
import * as pino from "pino";
import {Context} from "koa";
import {JPController} from "./controller/jp/JPController";
import {Storage} from "../fare/Storage";
import {OrderController} from "./controller/order/OrderController";
import axios from "axios";
import * as NodeRSA from "node-rsa";
import * as memoize from "memoized-class-decorator";
import {CurrencyExchange} from "../currency/CurrencyExchange";
import {SignatureProvider} from "../signature/SignatureProvider";
import {dev, live} from "../../config/config";
import {TicketWallet} from "@planar/ticket-wallet";
import Web3 = require("web3");
import {Contract} from "web3/types";
import {FulfilmentService} from "../fulfilment/FulfilmentService";

export class Container {
  
  public async getKoaService(): Promise<KoaService> {
    return new KoaService(
      this.config.koa.port,
      this.getLogger(),
      this.config.journeyPlanner.url,
      {
        filter: (ctx: Context) => ctx.request.path === "/jp",
        port: this.config.journeyPlanner.port,
        https: this.config.journeyPlanner.port === 443,
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
      axios.create(this.config.orderService),
      new NodeRSA(this.config.awt.key),
      this.getStorage(),
      this.getSignatureProvider(),
      this.getCurrencyExchange(),
      this.config.ethereum.address
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
      this.web3.eth.accounts.privateKeyToAccount(this.config.ethereum.privateKey) as any,
      this.web3.utils,
      this.getLogger()
    );
  }

  @memoize
  public get web3() {
    const provider = new Web3.providers.HttpProvider(this.config.ethereum.infura);

    return new Web3(provider);
  }

  @memoize
  public getTicketWallet(): Contract {
    return new this.web3.eth.Contract(TicketWallet.abi, TicketWallet.networks["3"].address);
  }

  @memoize
  public getCurrencyExchange(): CurrencyExchange {
    return new CurrencyExchange(
      axios.create(this.config.currencyService),
      this.web3.utils
    )
  }

  @memoize
  public getFulfilmentService(): FulfilmentService {
    return new FulfilmentService(
      this.getTicketWallet(),
      this.config.ethereum.address,
      this.web3.utils
    );
  }

  public get config() {
    return process.env.NODE_ENV === "dev" ? dev : live;
  }
}
