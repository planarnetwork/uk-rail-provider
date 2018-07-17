
export class FulfilmentService {

  constructor(
    private readonly wallet: TicketWallet
  ) {}

}

export interface TicketWallet {
  createTicket: (description: string, expiry: number, ticketCost: string, retailerId: number, url: string, signature: string) => Promise<number>;
}