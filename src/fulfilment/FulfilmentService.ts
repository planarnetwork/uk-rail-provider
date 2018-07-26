import {Contract} from "web3/types";
import {OrderPayment} from "../order/OrderPayment";
import {Logger} from "pino";

export class FulfilmentService {

  private processing = {};

  constructor(
    private readonly wallet: Contract,
    private readonly address: string,
    private readonly orderPayment: OrderPayment,
    private readonly logger: Logger
  ) {}

  public start(): void {
    setInterval(() => this.run(), 5 * 1000);
  }

  private async run(): Promise<void> {
    try {
      const queue = await this.wallet.methods
        .getFulfilmentQueue()
        .call({ from: this.address });

      await Promise.all(queue.map(tokenId => this.processTicket(tokenId)));
    }
    catch (err) {
      this.logger.error(err);
    }
  }

  private async processTicket(tokenId: number): Promise<void> {
    if (this.processing[tokenId]) {
      return;
    }

    this.logger.debug(`Processing ${tokenId}`);
    this.processing[tokenId] = true;

    try {
      const uri = await this.wallet.methods.tokenURI(tokenId).call({ from: this.address });
      const order = await this.orderPayment.pay(uri);

      await this.fulfil(tokenId, "tod://" + order.data.delivery.collectionReference);
    }
    catch (err) {
      this.logger.error(err);

      await this.fulfil(tokenId, "failure");
    }
    finally {
      delete this.processing[tokenId];
    }
  }

  private async fulfil(tokenId, fulfilmentUrl) {
    const gas = await this.wallet.methods
      .fulfilTicket(tokenId, fulfilmentUrl)
      .estimateGas({ from: this.address });

    await this.wallet.methods
      .fulfilTicket(tokenId, fulfilmentUrl)
      .send({ from: this.address, gas: gas });
  }

}

