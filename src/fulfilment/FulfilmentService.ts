import {Contract} from "web3/types";

export class FulfilmentService {

  constructor(
    private readonly wallet: Contract,
    private readonly address: string
  ) {}

  public start(): void {
    setInterval(() => this.run(), 60 * 1000);
  }

  private async run(): Promise<void> {
    try {
      const queue = await this.wallet.methods.getFulfilmentQueue().call({
        from: this.address
      });

      await Promise.all(queue.map(ticketId => this.processTicket(ticketId)));
    }
    catch (err) {
      console.log(err);
    }
  }

  private async processTicket(ticketId: number): Promise<void> {
    const uri = await this.wallet.methods.tokenURI(ticketId).call({
      from: this.address
    });

    console.log(ticketId, uri);
  }
}
