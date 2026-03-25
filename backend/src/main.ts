import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import helmet from "helmet";
import { Request, Response, NextFunction } from "express";

const DEFAULT_JWT_SECRET = "your-secret-key";
const PRODUCTION_REQUIRED_ENV_VARS = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "PAYMENT_CALLBACK_SECRET",
];
const DEVELOPMENT_REQUIRED_ENV_VARS = ["JWT_SECRET"];
const WEAK_SECRET_PATTERNS = [
  "your-secret-key",
  "your-super-secret",
  "change-this",
  "default",
  "test",
  "password",
  "secret",
];

function validateEnvironment() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";
  const requiredEnvVars = isProduction
    ? PRODUCTION_REQUIRED_ENV_VARS
    : DEVELOPMENT_REQUIRED_ENV_VARS;

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }

  const checkWeakSecret = (key: string, value: string | undefined) => {
    if (!value) return;
    const isWeak = WEAK_SECRET_PATTERNS.some((pattern) =>
      value.toLowerCase().includes(pattern.toLowerCase()),
    );
    if (isWeak || value.length < 32) {
      if (isProduction) {
        errors.push(
          `${key} is too weak! Must be at least 32 characters and not contain default values.`,
        );
      } else {
        warnings.push(
          `${key} is weak. For production, use at least 32 random characters.`,
        );
      }
    }
  };

  checkWeakSecret("JWT_SECRET", process.env.JWT_SECRET);
  checkWeakSecret("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET);
  checkWeakSecret(
    "PAYMENT_CALLBACK_SECRET",
    process.env.PAYMENT_CALLBACK_SECRET,
  );

  if (warnings.length > 0) {
    console.warn("========================================");
    console.warn("⚠️  ENVIRONMENT WARNINGS");
    console.warn("========================================");
    warnings.forEach((warn) => console.warn(`  - ${warn}`));
    console.warn("========================================");
  }

  if (errors.length > 0) {
    console.error("========================================");
    console.error("❌ ENVIRONMENT VALIDATION FAILED");
    console.error("========================================");
    console.error("Please fix the following issues:");
    errors.forEach((err) => console.error(`  - ${err}`));
    console.error("========================================");
    if (isProduction) {
      console.error("Production startup aborted due to security concerns.");
      process.exit(1);
    }
  }
}

async function bootstrap() {
  validateEnvironment();

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const allowedOrigins = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  ).split(",").map(o => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // 允许无 origin 的请求（如 curl、移动端）
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix("api/v1", {
    exclude: ["/", "/health"],
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === "/") {
      return res.redirect("/api/docs");
    }
    if (req.path === "/health") {
      return res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "Yunmu Game Store API",
        version: "1.0.0",
      });
    }
    next();
  });

  const config = new DocumentBuilder()
    .setTitle("云幕游戏商店平台 API")
    .setDescription("云幕游戏商店平台后端API接口文档")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
