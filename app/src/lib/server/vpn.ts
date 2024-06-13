import { execute, parseJsonResponse } from "./adapter";

export async  function getDomains(): Promise<string[]> {
    const {outData, errData} = await execute(["vpn-domains", "list"]);
    if (errData) {
        console.error("getDomains error ", outData);
        console.error(errData);
    }
    const {domains} = await parseJsonResponse(outData);
    return domains;
}

export async  function scanUpdate() {
    // yarn scan ips
    // yarn update-ip-group
    // yarn update-vpn-rules
    const {outData: outScanIps, errData: errScanIps} = await execute(["scan", "ips"]);
    if (errScanIps) {
      console.error("scanUpdate out:", outScanIps);
      console.error("scanUpdate err:", errScanIps);
      return {error: "scanUpdate error", data: {outScanIps, errScanIps}};
    }
    const {outData: outUpdateIpGroup, errData: errUpdateIpGroup} = await execute(["update-ip-group"]);
    if (errUpdateIpGroup) {
      console.error("scanUpdate out:", outUpdateIpGroup);
      console.error("scanUpdate err:", errUpdateIpGroup);
      return {error: "scanUpdate error", data: {outUpdateIpGroup, errUpdateIpGroup}};
    }
    const {outData: outUpdateVpnRules, errData: errUpdateVpnRules} = await execute(["update-vpn-rules"]);
    if (errUpdateVpnRules) {
      console.error("scanUpdate out:", outUpdateVpnRules);
      console.error("scanUpdate err:", errUpdateVpnRules);
      return {error: "scanUpdate error", data: {outUpdateVpnRules, errUpdateVpnRules}};
    }
    return {
        outData: {outScanIps, outUpdateIpGroup, outUpdateVpnRules},
        errData: {errScanIps, errUpdateIpGroup, errUpdateVpnRules},
    };
}