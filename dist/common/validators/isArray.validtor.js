"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function IsArray(optional, validationOptions) {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            name: 'IsArray',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    return value ? Array.isArray(value) : optional;
                },
            },
        });
    };
}
exports.IsArray = IsArray;
//# sourceMappingURL=isArray.validtor.js.map