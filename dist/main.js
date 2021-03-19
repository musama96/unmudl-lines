"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const validation_pipe_1 = require("./common/validation.pipe");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const compression = require("compression");
const config_1 = require("./config/config");
const fs = require("fs");
const express_1 = require("express");
const checkAuthorization_middleware_1 = require("./middlewares/checkAuthorization.middleware");
const handlebars = require('handlebars');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new validation_pipe_1.ValidationPipe());
    app.use(checkAuthorization_middleware_1.checkAuth);
    app.enableCors();
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        next();
    });
    app.use(express_1.json({ limit: '50mb' }));
    app.use(express_1.urlencoded({ extended: true, limit: '50mb' }));
    app.use(compression());
    app.useStaticAssets(path_1.join(__dirname, '..', 'public'));
    if (process.env.NODE_ENV == 'development') {
        const swaggerOptions = new swagger_1.DocumentBuilder()
            .addBearerAuth()
            .setTitle('Unmudl APIs Documentation')
            .setDescription('Unmudl documentation page for describing college, admin and user portal APIs')
            .setVersion('1.0')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerOptions);
        fs.writeFileSync('./public/swagger-spec.json', JSON.stringify(document));
        swagger_1.SwaggerModule.setup('api/documentation', app, document);
    }
    await app.listen(config_1.PORT, config_1.HOSTNAME);
}
bootstrap();
//# sourceMappingURL=main.js.map