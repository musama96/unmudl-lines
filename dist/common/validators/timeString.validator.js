"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const common_1 = require("@nestjs/common");
const moment = require("moment");
function IsTimeString(validationOptions) {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            name: 'IsTimeString',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    try {
                        return (moment(moment(value, 'LT').format('LT'), 'LT', true).isValid());
                    }
                    catch (e) {
                        throw new common_1.HttpException({
                            status: common_1.HttpStatus.BAD_REQUEST,
                            message: 'Validation failed: Please check individual fields for specific errors.',
                            errors: [{
                                    time: 'start and end must be a valid time string.',
                                }],
                        }, common_1.HttpStatus.BAD_REQUEST);
                    }
                },
            },
        });
    };
}
exports.IsTimeString = IsTimeString;
//# sourceMappingURL=timeString.validator.js.map