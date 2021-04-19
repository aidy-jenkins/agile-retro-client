import { Linq } from "../node_modules/linq-fast/Linq";

let linqScr = document.createElement("script");
linqScr.type = "text/javascript";
linqScr.src = "../node_modules/linq-fast/Linq.js";
document.head.appendChild(linqScr)

export const linqWrapper = { get linq(){ return exports.linq as typeof Linq; } };