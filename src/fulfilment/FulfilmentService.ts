import {Contract} from "web3/types";
import {OrderPayment} from "../order/OrderPayment";

export class FulfilmentService {

  constructor(
    private readonly wallet: Contract,
    private readonly address: string,
    private readonly orderPayment: OrderPayment
  ) {}

  public start(): void {
    setInterval(() => this.run(), 60 * 1000);
  }

  private async run(): Promise<void> {
    try {
      const queue = await this.wallet.methods
        .getFulfilmentQueue()
        .call({ from: this.address });

      await Promise.all(queue.map(tokenId => this.processTicket(tokenId)));
    }
    catch (err) {
      console.log(err);
    }
  }

  private async processTicket(tokenId: number): Promise<void> {
    try {
      const uri = await this.wallet.methods.tokenURI(tokenId).call({ from: this.address });
      const order = await this.orderPayment.pay(uri);

      await this.wallet.methods
        .fulfilTicket(tokenId, `tod://${order.data.delivery.collectionReference}`)
        .send({ from: this.address });
    }
    catch (err) {
      console.log(err);
    }
  }

}

