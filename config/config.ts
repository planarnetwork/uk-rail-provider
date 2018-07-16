import {config as ethereumConfig} from "./retail/config";
import {awt as awtKey} from "./awt/private";

export const dev = {
  journeyPlanner: {
    url: "traintickets.to",
    port: 443
  },
  orderService: {
    baseURL: "https://railsmartr.stage.assertis.co.uk/",
    headers: {
      "X-Tenant": "rsm"
    },
  },
  currencyService: {
    baseURL: "https://min-api.cryptocompare.com/"
  },
  ethereum: ethereumConfig,
  awt: {
    key: awtKey
  },
  koa: {
    port: 8002
  }
};

export const live = Object.assign({}, dev, {
  journeyPlanner: {
    url: "localhost",
    port: 8000
  }
});