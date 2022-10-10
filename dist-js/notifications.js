"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const electron_1 = require("electron");
function createNotification(title, body, action) {
    const notification = new electron_1.Notification({
        body,
        title
    });
    if (action) {
        notification.on('click', action);
    }
    notification.show();
}
exports.createNotification = createNotification;
