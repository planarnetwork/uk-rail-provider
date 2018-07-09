import {AxiosInstance} from "axios";
import {Utils} from "web3/types";

export class CurrencyExchange {

  constructor(
    private readonly api: AxiosInstance,
    private readonly utils: Utils
  ) { }

  /**
   * Use the API to convert the given price from pence into wei
   */
  public async getWei(pricePence: number): Promise<string> {
    const response = await this.api.get<ExchangeRateResponse>("/data/price?fsym=ETH&tsyms=GBP");
    const rate = response.data.GBP * 100;
    const ethPrice = pricePence / rate;

    return this.utils.toWei(ethPrice.toString(), "ether");
  }
}

export interface ExchangeRateResponse {
  "GBP": number;
}