import {Context} from "koa";
import {AxiosInstance} from "axios";

export class OrderController {

  constructor(
    private readonly orderService: AxiosInstance
  ) {}

  public async post(ctx: Context): Promise<void> {
    const response = await this.orderService.post("/auth");

    console.log(response);

    ctx.body = response.data;
  }

}