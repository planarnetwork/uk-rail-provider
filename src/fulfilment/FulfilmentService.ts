
export class FulfilmentService {

  constructor(
    private readonly wallet: TicketWalletContract
  ) {}

}

export interface TicketWalletContract {
  createTicket: (description: string, expiry: number, ticketCost: string, retailerId: number, url: string, signature: string) => Promise<number>;
}