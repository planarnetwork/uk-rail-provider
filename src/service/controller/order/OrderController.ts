import {Context} from "koa";
import {AxiosInstance} from "axios";
import autobind from "autobind-decorator";
import * as NodeRSA from "node-rsa";

@autobind
export class OrderController {

  constructor(
    private readonly orderService: AxiosInstance,
    private readonly key: NodeRSA
  ) {}

  public async post(ctx: Context): Promise<void> {
    const token = await this.getSessionToken();

    ctx.body = token;
  }

  private async getSessionToken(): Promise<string> {
    const text = Math.random() + "";
    const signature = this.key.encryptPrivate(text, "base64");
    const vendor = "planar";
    const response = await this.orderService.post<AuthResponse>("/auth", { vendor, text, signature });

    return response.data.data.token;
  }

}

/**
 * Response from AWT /auth
 */
interface AuthResponse {
  data: {
    token: string
  }
}