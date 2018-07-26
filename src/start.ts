
import {KoaService} from "./service/KoaService";
import {Container} from "./service/Container";

const container = new Container();

container.getKoaService()
  .then((koa: KoaService) => koa.start())
  .then(() => container.getFulfilmentService().start())
  .catch(console.error);
