import {OrderStorage} from "./OrderStorage";
import {AxiosInstance} from "axios";
import {Links} from "../service/controller/jp/JPController";

export class OrderPayment {

  constructor(
    private readonly awt: AxiosInstance,
    private readonly orderStorage: OrderStorage
  ) {}

  public async pay(uri): Promise<OrderWithDelivery> {
    const { headers, totalPricePence } = this.orderStorage.get(uri);
    const request = { order: uri, amount: totalPricePence, currency: "GBP", warrantAccountNumber: "", warrantNumber: "" };

    await this.awt.post("/account-warrant", request, { headers });

    return this.awaitFulfilment(uri, headers);
  }

  private async awaitFulfilment(uri: string, headers: object): Promise<OrderWithDelivery> {
    const response = await this.awt.get(uri, { headers });

    if (response.data.data.delivery.collectionReference) {
      return response.data;
    }
    else {
      return this.awaitFulfilment(uri, headers);
    }
  }
}

interface OrderWithDelivery {
  data: {
    uri: string;
    totalPricePence: number;
    delivery: {
      collectionReference: string;
    }
  },
  links: Links
}
