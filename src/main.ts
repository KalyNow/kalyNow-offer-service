import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle("KalyNow Offer Service")
    .setDescription(
      "API for managing restaurants, offers, and reservations.\n\n" +
      "**Authentication**: This service sits behind Traefik forwardAuth. " +
      "In production, headers are injected automatically. " +
      "For local testing, add the headers manually below."
    )
    .setVersion("0.0.1")
    .addApiKey({ type: "apiKey", name: "X-User-Id", in: "header" }, "X-User-Id")
    .addApiKey(
      { type: "apiKey", name: "X-User-Email", in: "header" },
      "X-User-Email"
    )
    .addApiKey(
      { type: "apiKey", name: "X-User-Role", in: "header" },
      "X-User-Role"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
