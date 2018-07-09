
export interface SignatureProvider {
  sign: (id: string, price: number, expiry: number) => string;
}
