"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (value) {
    if (value === undefined)
        return true;
    if (isNaN(value))
        return true;
    if (Array.isArray(value) && !value.length)
        return true;
    if (value === "")
        return true;
    if (value === null)
        return true;
    return false;
});
//# sourceMappingURL=isFalsy.js.map