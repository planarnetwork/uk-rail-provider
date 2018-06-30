
import {DatabaseConnection} from "mysql2";
import {Links} from "../service/KoaService";
import {isString} from "util";

export class FareStorage {

  constructor(
    private readonly database: FareDatabase
  ) {}

  public store(id: string, links: Links): void {
    const fareOption = links[id] as FareOption;
    const relevantLinks = this.fetchLinks({}, links, fareOption);

    this.database[id] = {
      response: fareOption,
      links: relevantLinks
    };
  }

  private fetchLinks(newLinks: Links, links: Links, obj: object): object {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && isString(obj[key]) && obj[key].charAt(0) === "/") {
        newLinks[key] = links[key];

        this.fetchLinks(newLinks, links, newLinks[key]);
      }
    }

    return newLinks;
  }

}

interface FareOption {
  fares: string[];
  totalPrice: number;
}

interface FareDatabase {
  [fareId: string]: {
    response: FareOption,
    links: Links
  }
}
