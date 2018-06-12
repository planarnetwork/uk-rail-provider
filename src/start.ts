
import {KoaService} from "./service/KoaService";
import {Container} from "./service/Container";

const container = new Container();

container.getKoaService()
  .catch(console.error)
  .then((koa: KoaService) => koa.start());
