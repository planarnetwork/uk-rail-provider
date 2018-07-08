import {SignatureProvider} from "./SignatureProvider";
import {Logger} from "pino";
import * as W3 from 'web3';

// https://github.com/ethereum/web3.js/issues/1248#issuecomment-385207638
const Web3 = require('web3'); // tslint:disable-line

export class EthereumSignatureProvider extends SignatureProvider {
  private web3: W3.default;
  
  public accountIndex: number;
  
  constructor(
    private readonly nodeUrl: string,
    private readonly privateKey: string,
    private readonly logger: Logger) {
    super();
    
    this.web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
    const account = this.web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    const {index} = this.web3.eth.accounts.wallet.add(account);
    
    logger.debug(`Added account @ index ${index}`);
    
    this.accountIndex = index;
  }
  
  hash(params: string[]): string {
    const hash = this.web3.utils.soliditySha3(params.join(""));
    this.logger.debug(`hash(${params}) = ${hash}`);
    return hash;
  }
  
  async sign(hash: string): Promise<string> {
    const signed = await this.web3.eth.sign(hash, this.privateKey);
    this.logger.debug(`sign(${hash}) = ${signed}`);
    return signed;
  }
}