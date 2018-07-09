import {Context} from "koa";
import {AxiosInstance} from "axios";
import autobind from "autobind-decorator";
import * as NodeRSA from "node-rsa";
import {Storage} from "../../../fare/Storage";
import {Links} from "../jp/JPController";
import {SignatureProvider} from "../../../signature/SignatureProvider";
import {CurrencyExchange} from "../../../currency/CurrencyExchange";

@autobind
export class OrderController {

  constructor(
    private readonly orderService: AxiosInstance,
    private readonly key: NodeRSA,
    private readonly storage: Storage,
    private readonly signatureProvider: SignatureProvider,
    private readonly exchange: CurrencyExchange
  ) {}

  public async post(ctx: Context): Promise<void> {
    const token = await this.getSessionToken();
    const {data, links} = await this.createOrder(ctx.request.body as CreateOrderRequest, token);
    const price = await this.exchange.getWei(this.getPricePence(links));
    const uri = data.uri;
    const expiry = Math.floor(Date.now() / 1000) + 38600;
    const signature = this.signatureProvider.sign(uri, price, expiry);

    ctx.body = {
      data: { uri, price, expiry, signature }, links
    };
  }

  private async getSessionToken(): Promise<string> {
    const text = Math.random() + "";
    const signature = this.key.encryptPrivate(text, "base64");
    const vendor = "planar";

    try {
      const response = await this.orderService.post<AuthResponse>("/auth", { vendor, text, signature });

      return response.data.data.token;
    }
    catch (err) {
      console.log(err.config.headers);
      console.log({ vendor, text, signature });
      console.log(err.response.data);

      throw new Error("Unable to create token");
    }
  }

  private async createOrder(koaRequest: CreateOrderRequest, token: string): Promise<OrderResponse> {
    const headers = { "X-Auth-Token": token };
    const request = this.getCreateOrderRequest(koaRequest);

    try {
      const response = await this.orderService.post<OrderResponse>("/order", request, { headers });

      // might be able to remove this for performance
      await this.orderService.post(response.data.data.uri + "/delivery", this.getDeliveryRequest(), { headers });

      return response.data;
    }
    catch (err) {
      console.log(err.response.data);

      throw new Error("Unable to create order");
    }
  }

  private getCreateOrderRequest({ items }: CreateOrderRequest): CreateOrderRequest {
    let links = this.addItem({}, items.outward.journey);

    if (items.inward) {
      links = this.addItem(links, items.inward.journey);
    }

    if (items.fares.inwardSingle) {
      links = this.addItem(links, items.fares.inwardSingle);
    }

    if (items.fares.outwardSingle) {
      links = this.addItem(links, items.fares.outwardSingle);
    }

    if (items.fares.return) {
      links = this.addItem(links, items.fares.return);
    }

    return { items, links };
  }

  private addItem(links: Links, id: string): Links {
    const item = this.storage.get(id);

    if (!item) {
      throw new Error(id + " not found.");
    }

    return Object.assign(links, item.links, { [id]: item.response });
  }

  private getDeliveryRequest() {
    return {
      "delivery": {
        "type": "/delivery/tod",
      }
    };
  }

  private getPricePence(links: Links): number {
    return Object.keys(links).reduce((total, key) => {
      return key.startsWith("/ticket/") ? total + links[links[key].fare].price : total;
    }, 0);
  }
}


/**
 * Response from AWT /auth
 */
interface AuthResponse {
  data: {
    token: string
  }
}

interface RequestItems {
  outward: {
    journey: string;
  },
  inward?: {
    journey: string;
  },
  fares: {
    outwardSingle?: string;
    inwardSingle?: string;
    return?: string;
  }
}

interface CreateOrderRequest {
  items: RequestItems,
  links: Links
}

interface OrderResponse {
  data: {
    uri: string
  },
  links: Links
}

interface ResponseBody {
  uri: string,
  price: number,
  expiry: number
}