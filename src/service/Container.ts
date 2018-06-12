import {KoaService} from "./KoaService";
import * as pino from "pino";

export class Container {

  public async getKoaService(): Promise<KoaService> {
    return new KoaService(
      7001,
      pino({ prettyPrint: true }),
      {
        url: "traintickets.to",
        port: 443
      },
      await this.getDatabase()
    );
  }

  public async getDatabase() {
    try {
      return await require("mysql2/promise").createPool({
        host: process.env.DATABASE_HOSTNAME || "localhost",
        user: process.env.DATABASE_USERNAME || "root",
        password: process.env.DATABASE_PASSWORD || null,
        database: process.env.DATABASE_NAME || "offer",
        connectionLimit: 2
      });
    }
    catch (err) {
      console.error(err);
    }
  }
}