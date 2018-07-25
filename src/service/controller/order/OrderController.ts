import {Context} from "koa";
import autobind from "autobind-decorator";
import {SignatureProvider} from "../../../signature/SignatureProvider";
import {CurrencyExchange} from "../../../currency/CurrencyExchange";
import {CreateOrderRequest, OrderFactory} from "../../../order/OrderFactory";

@autobind
export class OrderController {

  constructor(
    private readonly orderFactory: OrderFactory,
    private readonly signatureProvider: SignatureProvider,
    private readonly exchange: CurrencyExchange,
    private readonly retailerAddress: string,
  ) {}

  public async post(ctx: Context): Promise<void> {
    const {data, links} = await this.orderFactory.create(ctx.request.body as CreateOrderRequest);
    const price = await this.exchange.getWei(data.totalPricePence);
    const uri = data.uri;
    const expiry = Math.floor(Date.now() / 1000) + 38600;
    const signature = this.signatureProvider.sign(uri, price, expiry);
    const address = this.retailerAddress;

    ctx.body = {
      data: { uri, price, expiry, signature, address }, links
    };
  }

}


