"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidTimeFormat = isValidTimeFormat;
exports.validateClassTimes = validateClassTimes;
const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
function isValidTimeFormat(value) {
    return TIME_REGEX.test(value);
}
function validateClassTimes(startTime, endTime) {
    if (!isValidTimeFormat(startTime)) {
        throw new Error("startTime deve estar no formato HH:mm");
    }
    if (endTime != null && endTime !== "" && !isValidTimeFormat(endTime)) {
        throw new Error("endTime deve estar no formato HH:mm");
    }
}
//# sourceMappingURL=timeValidation.js.map