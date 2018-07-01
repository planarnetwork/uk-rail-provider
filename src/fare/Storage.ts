
import {isString} from "util";
import {Links} from "../service/controller/jp/JPController";

export class Storage {

  constructor(
    private readonly database: Database,
    private readonly whitelist: string[] = ["/fare/", "/fare-option/", "/service/", "/leg/"]
  ) {}

  /**
   * Add them item and it's links to internal storage
   */
  public store(id: string, item: object, links: Links): void {
    const relevantLinks = this.fetchLinks({}, links, item);

    this.database[id] = {
      response: item,
      links: relevantLinks
    };
  }

  /**
   * Recursively scan the given object for links and add them to the newLinks object
   */
  private fetchLinks(newLinks: Links, links: Links, obj: object): object {
    for (const key in obj) {
      if (typeof obj[key] === "string" && this.whitelist.some(k => obj[key].startsWith(k))) {
        newLinks[obj[key]] = links[obj[key]];

        this.fetchLinks(newLinks, links, newLinks[obj[key]]);
      }
      else if (typeof obj[key] === "object" && obj[key] !== null) {
        this.fetchLinks(newLinks, links, obj[key]);
      }
    }

    return newLinks;
  }

  /**
   * Return an item an it's links from the internal storage
   */
  public get(id: string): DatabaseEntry | undefined {
    return this.database[id];
  }
}

interface Database {
  [fareId: string]: DatabaseEntry;
}

export interface DatabaseEntry {
  response: object;
  links: Links;
}
