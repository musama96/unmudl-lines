"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const responseMessages_1 = require("../config/responseMessages");
const config_1 = require("../config/config");
let ValidationPipe = class ValidationPipe {
    async transform(value, metadata) {
        const { metatype } = metadata;
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        for (const field in value) {
            if (!config_1.NUMBER_STRING_FIELDS.includes(field)) {
                if (value[field]) {
                    if (typeof value[field] === 'string') {
                        value[field] = value[field].trim();
                    }
                    value[field] = this.jsonParse(value[field]);
                }
            }
            if (value[field] && typeof value[field] === 'object') {
                if (!(value[field].length > 0)) {
                    for (const fieldC in value[field]) {
                        if (!value[field][fieldC] && value[field][fieldC] !== false) {
                            delete value[field][fieldC];
                        }
                    }
                }
            }
            else {
                if (!value[field] && value[field] !== '' && value[field] !== false && value[field] !== 0) {
                    delete value[field];
                }
                else if (value[field] === '') {
                    value[field] = null;
                }
            }
        }
        const object = class_transformer_1.plainToClass(metatype, value);
        const errors = await class_validator_1.validate(object);
        if (errors.length > 0) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.BAD_REQUEST,
                message: responseMessages_1.default.common.fieldValidationError,
                errors: this.formatErrors(errors),
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        return value;
    }
    jsonParse(field) {
        try {
            return JSON.parse(field);
        }
        catch (e) {
            return field;
        }
    }
    toValidate(metatype) {
        const types = [String, Boolean, Number, Array, Object];
        return !types.find(type => metatype === type);
    }
    formatErrors(errors) {
        const fieldErrors = {};
        for (let i = 0; i < errors.length; i++) {
            const err = errors[i];
            let children = true;
            for (const property in err.constraints) {
                children = false;
                if (err.constraints.hasOwnProperty(property)) {
                    fieldErrors[err.property] = err.constraints[property];
                }
            }
            if (children && err.children && err.children.length > 0) {
                const errs = {};
                for (let j = 0; j < err.children.length; j++) {
                    for (const property in err.children[j].constraints) {
                        errs[err.children[j].property] = err.children[j].constraints[property];
                    }
                }
                fieldErrors[err.property] = errs;
            }
        }
        return fieldErrors;
    }
    isEmpty(value) {
        if (Object.keys(value).length > 0) {
            return false;
        }
        return true;
    }
};
ValidationPipe = __decorate([
    common_1.Injectable()
], ValidationPipe);
exports.ValidationPipe = ValidationPipe;
//# sourceMappingURL=validation.pipe.js.map