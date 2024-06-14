// place files you want to import through the `$lib` alias in this folder.
import * as qos from "./client/qos";
import * as vpn from "./client/vpn";

import * as serverQos from "./server/qos";
import * as serverVpn from "./server/vpn";
import * as adapter from "./server/adapter";

const client = {
    qos,
    vpn
};
const server = {
    qos: serverQos,
    vpn: serverVpn,
    adapter
}

export { client, server };