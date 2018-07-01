
import {isString} from "util";
import {Links} from "../service/controller/jp/JPController";

export class Storage {

  constructor(
    private readonly database: Database
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
      if (obj.hasOwnProperty(key) && isString(obj[key]) && obj[key].charAt(0) === "/" && links[key]) {
        newLinks[key] = links[key];

        this.fetchLinks(newLinks, links, newLinks[key]);
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
