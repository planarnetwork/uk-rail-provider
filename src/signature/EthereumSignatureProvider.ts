import {SignatureProvider} from "./SignatureProvider";
import {Logger} from "pino";
import * as W3 from 'web3';
import {Utils} from "web3/types";

// https://github.com/ethereum/web3.js/issues/1248#issuecomment-385207638
const Web3 = require('web3'); // tslint:disable-line

export class EthereumSignatureProvider extends SignatureProvider {
  private account: any; // should be Account but typings are not wrong https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html?highlight=privatekey#eth-accounts-create-return
  private utils: Utils;
  
  constructor(
    private readonly nodeUrl: string,
    private readonly privateKey: string,
    private readonly logger: Logger) {
    super();
    
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
      this.account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
      this.utils = web3.utils;
    }
    catch (err) {
      throw new Error(`Failed to import Retailer account. ${err}`);
    }
  }
  
  hash(params: string[]): string {
    const hash = this.utils.soliditySha3(params.join(""));
    this.logger.debug(`hash(${params}) = ${hash}`);
    return hash;
  }
  
  async sign(hash: string): Promise<string> {
    const signed = await this.account.sign(hash);
    this.logger.debug(`sign(${hash}) = ${signed}`);
    return signed;
  }
}