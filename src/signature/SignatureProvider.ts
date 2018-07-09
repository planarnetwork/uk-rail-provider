import {Logger} from "pino";

export class SignatureProvider {

  constructor(
    private readonly account: EthAccount,
    private readonly utils: EthUtils,
    private readonly logger: Logger
  ) { }

  /**
   * Hash and sign the parameters using the ethereum account
   */
  public sign(id: string, price: string, expiry: number): string {
    const hash = this.utils.soliditySha3(toBytes32(id), "_", price, "_", expiry);
    const signedData = this.account.sign(hash);

    this.logger.debug(`hash(${toBytes32(id)}, "_", ${price}, "_", ${expiry}) = ${hash}`);
    this.logger.debug(`sign(${hash}) = ${signedData.signature}`);

    return signedData.signature;
  }

}

export interface EthAccount {
  sign: (data: string) => Signature;
}

interface EthUtils {
  soliditySha3: (...args: Array<string | number>) => string
}

interface Signature {
  message: string,
  messageHash: string,
  r: string,
  s: string,
  v: string,
  signature: string
}

/**
 * Convert a string to a hexidecimal string padded to 32 bytes
 */
function toBytes32(str) {
  let hex = '0x';

  for (let i = 0; i < 32; i++) {
    hex += str.length > i ? str.charCodeAt(i).toString(16) : '00';
  }

  return hex;
}
