
import {DatabaseConnection} from "mysql2";
import {Links} from "../service/KoaService";
import {isString} from "util";

export class FareSigner {

  private readonly fares = {};

  constructor(
    private readonly database: DatabaseConnection,
    private readonly links: Links
  ) {}

  public sign(id: string): string {
    const fareOption = this.links[id];
    const relevantLinks = this.fetchLinks({}, fareOption);

    this.fares[id] = {
      response: fareOption,
      links: relevantLinks
    };

    return this.createSignature(id, fareOption);
  }

  private fetchLinks(newLinks: Links, obj: Object): Object {
    for (const key in obj) {
      if (isString(obj[key]) && obj[key].charAt(0) === "/") {
        newLinks[key] = this.links[key];

        this.fetchLinks(newLinks, newLinks[key]);
      }
    }

    return newLinks;
  }

  private createSignature(id: string, fareOption: FareOption): string {
    return id + "/" + fareOption.totalPrice + "/" + Math.random();
  }

  public async commit(): Promise<void> {

  }

}

interface FareOption {
  fares: string[];
  totalPrice: number;
}