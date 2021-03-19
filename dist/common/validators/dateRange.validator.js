"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const common_1 = require("@nestjs/common");
function IsGreaterThanStart(property, validationOptions) {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            name: 'IsGreaterThanStart',
            target: object.constructor,
            propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    try {
                        const [relatedPropertyName] = args.constraints;
                        const relatedValue = args.object[relatedPropertyName];
                        if (new Date(value).getTime() >= new Date(relatedValue).getTime()) {
                            return true;
                        }
                        return false;
                    }
                    catch (e) {
                        throw new common_1.HttpException({
                            status: common_1.HttpStatus.BAD_REQUEST,
                            message: 'Validation failed: Please check individual fields for specific errors.',
                            errors: [{
                                    end: 'End value must be graeter than start.',
                                }],
                        }, common_1.HttpStatus.BAD_REQUEST);
                    }
                },
            },
        });
    };
}
exports.IsGreaterThanStart = IsGreaterThanStart;
//# sourceMappingURL=dateRange.validator.js.map