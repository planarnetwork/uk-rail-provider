
export class OrderStorage {

  constructor(
    private readonly database: OrderDatabase
  ) {}

  public store(orderId: string, headers: object, totalPricePence: number): void {
    this.database[orderId] = { orderId, headers, totalPricePence };
  }

  public get(orderId): OrderDetails {
    if (!this.database[orderId]) {
      throw new Error(`Order ${orderId} not found in storage`);
    }

    return this.database[orderId];
  }
}

export interface OrderDetails {
  orderId: string;
  headers: object;
  totalPricePence: number;
}

export interface OrderDatabase {
  [orderId: string]: OrderDetails;
}