"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = void 0;
function error(...message) {
    console.log(...message);
    throw new Error("Error");
}
exports.error = error;
