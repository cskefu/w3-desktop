"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewLogs = void 0;
const electron_1 = require("electron");
const electron_log_1 = require("electron-log");
function viewLogs() {
    electron_1.shell.openPath(electron_log_1.default.transports.file.findLogPath());
}
exports.viewLogs = viewLogs;
