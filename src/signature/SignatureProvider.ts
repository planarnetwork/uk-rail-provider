export abstract class SignatureProvider {
  abstract hash(params: string[]): string;
  abstract async sign(hash: string): Promise<string>;
}
