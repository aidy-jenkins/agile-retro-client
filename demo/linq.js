let linqScr = document.createElement("script");
linqScr.type = "text/javascript";
linqScr.src = "linqModule.js";
document.head.appendChild(linqScr);
export const linqWrapper = { get linq() { return exports.linq; } };
