"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const config_1 = require("./config");
const electronDebug = require("electron-debug");
const OPTIONS = {
    showDevTools: false,
    isEnabled: config_1.default.get(config_1.ConfigKey.DebugMode)
};
function init() {
    electronDebug(OPTIONS);
}
exports.init = init;
