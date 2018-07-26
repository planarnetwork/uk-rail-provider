import {KoaService} from "./KoaService";
import * as pino from "pino";
import {Context} from "koa";
import {JPController} from "./controller/jp/JPController";
import {JourneyPlanStorage} from "../order/JourneyPlanStorage";
import {OrderController} from "./controller/order/OrderController";
import axios, {AxiosInstance} from "axios";
import * as NodeRSA from "node-rsa";
import * as memoize from "memoized-class-decorator";
import {CurrencyExchange} from "../currency/CurrencyExchange";
import {SignatureProvider} from "../signature/SignatureProvider";
import {dev, live} from "../../config/config";
import {TicketWallet} from "@planar/ticket-wallet";
const Web3 = require("web3");
import {Contract} from "web3/types";
import {FulfilmentService} from "../fulfilment/FulfilmentService";
import {OrderStorage} from "../order/OrderStorage";
import {OrderFactory} from "../order/OrderFactory";
import {OrderPayment} from "../order/OrderPayment";

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
      this.getOrderFactory(),
      this.getSignatureProvider(),
      this.getCurrencyExchange(),
      this.config.ethereum.address
    );
  }

  @memoize
  public getJourneyPlanStorage(): JourneyPlanStorage {
    return new JourneyPlanStorage({});
  }

  @memoize
  public getOrderStorage(): OrderStorage {
    return new OrderStorage({});
  }

  @memoize
  public getJPController(): JPController {
    return new JPController(this.getJourneyPlanStorage());
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
    const web3 = new Web3(provider);
    const account = web3.eth.accounts.privateKeyToAccount(this.config.ethereum.privateKey);

    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    return web3;
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
      this.getOrderPayment(),
      this.getLogger()
    );
  }

  @memoize
  public getAWT(): AxiosInstance {
    return axios.create(this.config.orderService);
  }

  @memoize
  public getOrderFactory(): OrderFactory {
    return new OrderFactory(
      this.getAWT(),
      this.getJourneyPlanStorage(),
      this.getOrderStorage(),
      new NodeRSA(this.config.awt.key),
    );
  }

  @memoize
  public getOrderPayment(): OrderPayment {
    return new OrderPayment(
      this.getAWT(),
      this.getOrderStorage()
    );
  }

  public get config() {
    return process.env.NODE_ENV === "dev" ? dev : live;
  }
}
