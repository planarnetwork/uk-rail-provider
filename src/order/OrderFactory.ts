import {OrderStorage} from "./OrderStorage";
import {Links} from "../service/controller/jp/JPController";
import {AxiosInstance} from "axios";
import * as NodeRSA from "node-rsa";
import {JourneyPlanStorage} from "./JourneyPlanStorage";
import {Logger} from "pino";

export class OrderFactory {

  constructor(
    private readonly awt: AxiosInstance,
    private readonly jpStorage: JourneyPlanStorage,
    private readonly orderStorage: OrderStorage,
    private readonly key: NodeRSA,
    private readonly logger: Logger
  ) {}

  private async getSessionToken(): Promise<string> {
    const text = Math.random() + "";
    const signature = this.key.encryptPrivate(text, "base64");
    const vendor = "planar";

    try {
      const response = await this.awt.post<AuthResponse>("/auth", { vendor, text, signature });

      return response.data.data.token;
    }
    catch (err) {
      this.logger.error(err.config.headers);
      this.logger.error({ vendor, text, signature });
      this.logger.error(err.response.data);

      throw new Error("Unable to create token");
    }
  }

  public async create(koaRequest: CreateOrderRequest): Promise<OrderResponse> {
    const token = await this.getSessionToken();
    const headers = { "X-Auth-Token": token };
    const request = this.getCreateOrderRequest(koaRequest);

    try {
      const response = await this.awt.post<OrderResponse>("/order", request, { headers });

      // might be able to remove this for performance
      await this.awt.post(response.data.data.uri + "/delivery", this.getDeliveryRequest(), { headers });

      response.data.data.totalPricePence = this.getPricePence(response.data.links);

      this.orderStorage.store(response.data.data.uri, headers, response.data.data.totalPricePence);

      return response.data;
    }
    catch (err) {
      this.logger.error(err.response.data);

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
    const item = this.jpStorage.get(id);

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

export interface CreateOrderRequest {
  items: RequestItems,
  links: Links
}

interface OrderResponse {
  data: {
    uri: string;
    totalPricePence: number;
  },
  links: Links
}
