import {SignatureProvider} from "./SignatureProvider";
import {Logger} from "pino";
import {Utils} from "web3/types";

export class EthereumSignatureProvider implements SignatureProvider {

  constructor(
    private readonly account: EthereumAccount,
    private readonly utils: Utils,
    private readonly logger: Logger
  ) { }

  /**
   * Hash and sign the parameters using the ethereum account
   */
  public sign(id: string, price: number, expiry: number): string {
    const params = [id, price, expiry].join("");
    const hash = this.utils.soliditySha3(params);
    const signedData = this.account.sign(hash);

    this.logger.debug(`hash(${params}) = ${hash}`);
    this.logger.debug(`sign(${hash}) = ${signedData.signature}`);

    return signedData.signature;
  }

}

export interface EthereumAccount {
  sign: (data: string) => Signature;
}

interface Signature {
  message: string,
  messageHash: string,
  r: string,
  s: string,
  v: string,
  signature: string
}