"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const mongoose = require("mongoose");
function IsMongoId(optional, validationOptions) {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            name: 'IsMongoId',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (optional) {
                        return value ? mongoose.Types.ObjectId.isValid(value) : true;
                    }
                    else {
                        return value ? mongoose.Types.ObjectId.isValid(value) : false;
                    }
                },
            },
        });
    };
}
exports.IsMongoId = IsMongoId;
//# sourceMappingURL=isMongoId.validator.js.map