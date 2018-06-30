
import {Links} from "../service/KoaService";
import {isString} from "util";

export class Storage {

  constructor(
    private readonly database: Database
  ) {}

  public store(id: string, links: Links): void {
    const item = links[id];
    const relevantLinks = this.fetchLinks({}, links, item);

    this.database[id] = {
      response: item,
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

interface Database {
  [fareId: string]: {
    response: object,
    links: Links
  }
}
