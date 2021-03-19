import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from './common/validation.pipe';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import * as compression from 'compression';
import { HOSTNAME, PORT } from './config/config';
import * as fs from 'fs';
import { urlencoded, json } from 'express';
import { checkAuth } from './middlewares/checkAuthorization.middleware';
const handlebars = require('handlebars');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(checkAuth);
  
  // Enable CORS
  app.enableCors();
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Enable Compression
  app.use(compression());

  // add static directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  if (process.env.NODE_ENV == 'development') {
    // Initialize Swagger docs for API documentation
    const swaggerOptions = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Unmudl APIs Documentation')
      .setDescription('Unmudl documentation page for describing college, admin and user portal APIs')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerOptions);
    fs.writeFileSync('./public/swagger-spec.json', JSON.stringify(document));
    SwaggerModule.setup('api/documentation', app, document);
  }

  await app.listen(PORT, HOSTNAME);
}
bootstrap();
