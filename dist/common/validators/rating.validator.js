"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const common_1 = require("@nestjs/common");
function IsRating(validationOptions) {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            name: 'IsRating',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(ratings, args) {
                    try {
                        let isValid = true;
                        ratings.forEach(item => {
                            const n = Number(item);
                            if (!(n && n > 0 && n <= 5)) {
                                isValid = false;
                            }
                        });
                        if (!isValid) {
                            throw new common_1.HttpException({
                                status: common_1.HttpStatus.BAD_REQUEST,
                                message: 'Validation failed: Please check individual fields for specific errors.',
                                errors: [{
                                        rating: 'Rating must be a stringified array of numbers between 1 and 5.',
                                    }],
                            }, common_1.HttpStatus.BAD_REQUEST);
                        }
                        return isValid;
                    }
                    catch (e) {
                        throw new common_1.HttpException({
                            status: common_1.HttpStatus.BAD_REQUEST,
                            message: 'Validation failed: Please check individual fields for specific errors.',
                            errors: [{
                                    rating: 'Rating must be a stringified array of numbers between 1 and 5.',
                                }],
                        }, common_1.HttpStatus.BAD_REQUEST);
                    }
                },
            },
        });
    };
}
exports.IsRating = IsRating;
//# sourceMappingURL=rating.validator.js.map