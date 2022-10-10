"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoFixUserAgent = exports.removeCustomUserAgent = void 0;
const electron_1 = require("electron");
const helpers_1 = require("./helpers");
const config_1 = require("./config");
const userAgents = require("./user-agents.json");
function removeCustomUserAgent() {
    config_1.default.set(config_1.ConfigKey.CustomUserAgent, '');
    electron_1.app.relaunch();
    electron_1.app.quit();
}
exports.removeCustomUserAgent = removeCustomUserAgent;
function autoFixUserAgent() {
    config_1.default.set(config_1.ConfigKey.CustomUserAgent, userAgents[helpers_1.platform]);
    electron_1.app.relaunch();
    electron_1.app.quit();
}
exports.autoFixUserAgent = autoFixUserAgent;
