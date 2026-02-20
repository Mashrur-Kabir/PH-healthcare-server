# PH Healthcare Backend — Complete Setup Guide

This document explains **every step** required to initialize, structure, and run the PH Healthcare backend using:

- Node.js
- Express
- TypeScript
- Prisma ORM
- Better Auth
- ESLint

It also explains **why each step exists**, in very simple language.

---

# 1. Git Initialization & Branching Strategy

```bash
git init
git checkout -b development
git add .
git commit -m "init"
git checkout -b part-1
```

## What is happening here?

### `git init`

Creates a **new Git repository** so your project history can be tracked.

### `git checkout -b development`

Creates a **development branch**.

Why?

- You should **not work directly on `main`**.
- `main` is kept **stable and production-ready**.
- All real work happens in **sub-branches**.

### First commit

```bash
git add .
git commit -m "init"
```

This saves the **starting snapshot** of the project.

### `git checkout -b part-1`

Creates a **feature sub-branch** from `development`.

Think of it like:

```
main (stable production code)
   ↓
development (active working branch)
   ↓
part-1 (feature you are currently building)
```

---

## How sub-branches actually work (very simple)

- You **build features in small branches** like `part-1`, `part-2`, etc.
- When finished → merge into **development**.
- When development is stable → merge into **main**.

This prevents:

- breaking production
- messy history
- losing code

---

## How to commit properly inside a sub-branch

```bash
git add .
git commit -m "feat: create express server"
```

Then later:

```bash
git checkout development
git merge part-1
```

Now the feature becomes part of **development**.

---

# 2. Node + TypeScript Initialization

```bash
npm init
npx tsc --init
npm i express
npm i -D typescript @types/node @types/express
```

## Dependency explanations

- **express** → The Express framework for building the server.
- **typescript** → The TypeScript compiler.
- **@types/node and @types/express** → Type definitions for Node.js and Express to ensure TypeScript compatibility.

---

# 3. TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "moduleResolution": "node10",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Why this exists

- Compiles **TypeScript → JavaScript**
- Keeps source in **src** and output in **dist**
- Enables **strict type safety** (very important for real projects)

---

# 4. Create Base Source Files

Create:

```
src/app.ts
src/server.ts
```

---

# 5. Create the Express Server

Open `src/server.ts` and add:

```ts
import express, { Application, Request, Response } from "express";

const app: Application = express();
const port = 5000; // The port your express server will be running on.

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

## Explanation

- We import **express** and the **Application, Request, Response** types from Express.
- The server listens on **port 3000** (conceptually the running port of the server).
- A simple **GET route at /** responds with a greeting.
- `express.urlencoded({ extended: true })` parses incoming **URL‑encoded form data**.
- `express.json()` parses incoming **JSON requests**.

---

# 6. Configure Scripts in `package.json`

Install:

```bash
npm i -D tsx
```

Update the scripts section in `package.json`:

```json
"scripts": {
  "start": "node dist/server.js",
  "build": "tsc watch src/server.ts",
  "dev": "tsx watch src/server.ts"
}
```

## Script details

- **start** → Runs the compiled JavaScript code.
- **build** → Compiles TypeScript to JavaScript in the `dist` folder set in `tsconfig.json`.
- **dev** → Uses **tsx** and auto‑restarts on changes.

Run using:

```bash
npm run dev
```

---

# 7. Separation of `server.ts` and `app.ts`

Install:

```bash
npm add dotenv
```

Create `.env`:

```
PORT=your backend port
```

---

## `src/app.ts`

```ts
import express, { Application, Request, Response } from "express";

const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello! from PH-healthcare Server :)");
});

export default app;
```

---

## `src/server.ts`

```ts
import app from "./app";

// Start the server
const bootstrap = () => {
  try {
    app.listen(5000, () => {
      console.log(`Server is running on http://localhost:5000`); <--keep it as is, we'll configure env later
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
};

bootstrap();
```

---

## Explanation of the separation

- **app.ts** → contains **middleware, routes, and express configuration**.
- **server.ts** → contains **only server startup logic**.

### Why this is important in real projects

- Makes **testing easier**.
- Allows **reuse of app without starting server**.
- Keeps **architecture clean and scalable**.

---

# 8. TypeScript‑ESLint Configuration (and why it is needed)

Install:

```bash
npm install --save-dev eslint @eslint/js typescript typescript-eslint
```

Create `eslint.config.mjs`:

```js
// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
```

Update scripts in `package.json`:

```json
"lint": "eslint ./src/**/*"
```

---

## Why ESLint is needed

- Detects **bugs and bad patterns early**.
- Enforces **clean and consistent code style**.
- Prevents **unsafe TypeScript usage**.

This is **mandatory in real production teams**.

---

# 9. Prisma Setup

Install:

```bash
npm i prisma @types/node @types/pg --save-dev
npm i @prisma/client @prisma/adapter-pg pg dotenv
```

---

## Update `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "es2023",
    "rootDir": "./",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "prisma.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Change in `package.json`:

```json
"type": "module"
```

Invoke Prisma CLI:

```bash
npx prisma
```

Initialize Prisma project:

```bash
npx prisma init --db --output ../generated/prisma
```

---

## Prisma Structural Layout

- Inside `./prisma`, create folder **schema**.
- Move `schema.prisma` into it.
- Create **separate model files** (`model-name.prisma`) in the same directory.

Update in `prisma.config.ts`:

```
schema: "prisma/schema"
```

Update generator output in `schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

---

## Instantiate Prisma Client

Create:

```
./src/app/lib/prisma.ts
```

Add:

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

---

## DATABASE_URL

Inside `.env`, use **local PostgreSQL credentials**:

```
postgresql://username:password@localhost:5432/prisma-blog-app?schema=public
```

---

## Prisma Commands

```bash
npx prisma migrate dev
npx prisma generate
```

Add shortcuts in `package.json`:

```json
"migrate": "prisma migrate dev",
"generate": "prisma generate",
"studio": "prisma studio",
"push": "prisma db push",
"pull": "prisma db pull"
```

---

# 10. Better‑Auth Setup

Install:

```bash
npm install better-auth
```

Add to `.env`:

```
BETTER_AUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BETTER_AUTH_URL=http://localhost:5000
```

---

## Create Better‑Auth Instance

Create:

```
./src/lib/auth.ts
```

Add:

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
```

---

## Generate Better‑Auth Prisma Schema

Create `auth.prisma` inside `./prisma/schema`.

Run:

```bash
npx @better-auth/cli@latest generate --output ./prisma/schema/auth.prisma --config ./src/app/lib/auth.ts
```

Add additional fields for **user** inside:

- `auth.prisma`
- `auth.ts`

Then run:

```bash
npm run migrate
npm run generate
```

---

## Handling Auth Requests via Custom Module

Instead of Better‑Auth catch‑all handler, create:

```
./src/app/modules/auth
```

With:

- route
- controller
- service

### Why this approach is better

- Keeps **architecture consistent** with other modules.
- Makes **business logic scalable**.
- Improves **testing and maintainability**.
- Matches **real production backend structure**.

---

Perfect — I’ll continue the **README in the exact same detailed style** as before,
**without removing anything**, while improving the **clarity of the explanation parts (`explain **`)\*\*.

---

# 11. Environment Variable Configuration

Create **`/config/env.ts`** inside `./src`:

```ts
import dotenv from "dotenv";
import { EnvConfig } from "../app/types";

dotenv.config();

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariable = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
  ];

  requiredEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(
        `Environment variable ${variable} is required but not set in .env file`,
      );
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
  };
};

export const envVars = loadEnvVariables();
```

---

### Why this is important (clear explanation)

Environment variables are **critical configuration values** that must exist before the server starts.

This setup:

- **Loads `.env` automatically**
- **Stops the server immediately** if any required variable is missing
  → prevents runtime crashes in production
- Provides **fully typed configuration** across the project

This is a **production-grade pattern used in real backend systems**.

---

### Update usage locations

**In `server.ts`:**

```ts
const PORT = envVars.PORT;
```

**In `prisma.config.ts`:**

```ts
datasource: {
  url: envVars.DATABASE_URL,
}
```

**In `./app/lib/prisma.ts`:**

```ts
const connectionString = envVars.DATABASE_URL;
```

---

# 12. Zod Validation

### Goal (better explanation)

We validate request data **before it reaches the database layer**.

Why this matters:

- Prevents **invalid or malicious data** from hitting Prisma
- Saves **database resources**
- Returns **clear validation errors to client**
- Keeps **services clean and focused on business logic**

This is a **standard enterprise backend pattern**.

---

### Install

```bash
npm i zod
```

---

### Create validation middleware

Create:

```
./app/middleware/validateRequest.ts
```

```ts
import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });

      req.body = result.body;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default validateRequest;
```

---

### Example module validation

**`doctor.validation.ts`**

```ts
import { z } from "zod";
import { Gender } from "../../../generated/prisma/enums";

const updateDoctorSchema = z.object({
  body: z
    .object({
      name: z.string(),
      profileImg: z.url("Invalid profile image URL"),
      contactNumber: z.string().length(11, "Contact number must be 11 digits"),
      address: z.string(),
      isDeleted: z.boolean(),
      registrationNumber: z.string(),
      experience: z.number().int().nonnegative(),
      gender: z.enum([Gender.MALE, Gender.FEMALE]),
      appointmentFee: z.number().positive("Fee must be a positive number"),
      qualification: z.string(),
      currentWorkingPlace: z.string(),
      designation: z
        .string()
        .min(2, "Designation must be at least 2 characters")
        .max(100, "Designation must be less than 100 characters"),
      specialties: z.array(z.uuid("Invalid Specialty ID format")),
    })
    .partial()
    .strict(),
});

export const doctorValidation = {
  updateDoctorSchema,
};
```

---

### Usage in route

```ts
router.patch(
  "/:id",
  validateRequest(doctorValidation.updateDoctorSchema),
  doctorController.updateDoctor,
);
```

---

# 13. JWT Authentication & Authorization

## Why JWT is needed (clear, precise explanation)

We need **secure identity verification** and **role-based access control**.

Different tokens serve different purposes:

### 1 Better-Auth Session Token (database session)

- **Opaque random string**
- Server checks **database session table**
- Enables:
  - logout from all devices
  - session expiry
  - IP/user-agent tracking

- **Stateful authentication**

---

### 2 Access Token (JWT)

- **Stateless**
- Contains **user ID + role**
- Verified using **digital signature**
- Used for:
  - fast authentication
  - role-based authorization
  - avoiding DB query on every request

---

### 3 Refresh Token (JWT)

- **Long-lived**
- Used to **generate new access token**
- Prevents forcing user to log in again frequently

---

## Install dependencies

```bash
npm i jsonwebtoken
npm i -D @types/jsonwebtoken
npm i cookie-parser
npm i -D @types/cookie-parser
```

---

## Environment variables

Add to `.env`:

```
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN=
BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE=
```

Generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Update env config

Update **`src/config/env.ts`** to include new variables.

---

## Better-Auth session configuration

Inside **`app/lib/auth.ts`**:

```ts
session: {
  expiresIn: Number(ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)),
  updateAge: Number(ms(envVars.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as StringValue)),
  cookieCache: {
    enabled: true,
    maxAge: Number(ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)),
  },
},
```

---

## Controller & service updates

After **login/registration**:

- Generate **access token**
- Generate **refresh token**
- Set **secure HTTP-only cookies**
- Verify cookies appear correctly in browser/devtools

---

# Auth Middleware Architecture Explanation

Create:

```
./app/middleware/authMiddleware.ts
```

---

### 1. Gatekeeper — Access Token Verification

- Extract JWT from cookie
- Verify signature **before DB query**
- Stops **fake tokens immediately**
- Protects database from unnecessary load

---

### 2. Truth Layer — Session Verification

- Lookup **Better-Auth session in Prisma**
- Confirm:
  - session exists
  - belongs to real user
  - not expired

---

### 3. Security Audit — User Status Check

Even with valid session:

- If **blocked/deleted by admin**
- Access is **revoked instantly**

Acts as a **global kill switch**.

---

### 4. Expiry Warning Header

If session **< 20% lifetime left**:

- Add header:

```
X-Session-Refresh
```

Frontend can silently **refresh session**
→ prevents sudden logout.

---

### 5. Context Bridge — `req.user`

Attach verified user data to:

```ts
req.user;
```

Available everywhere:

- controllers
- services
- guards

---

### 6. Final Guard — Role Authorization (RBAC)

Compare:

```
required roles vs user role
```

If mismatch → **403 Forbidden**

Only valid roles reach controller.

---

#### Extra:

for http status:
install:

```bash
npm i http-status
```

---

# Global Type Declaration

Create:

```
./app/types/index.d.ts
```

handling the Global Express Request inside index.d.ts:

```ts
import { Role, UserStatus } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: Role;
        emailVerified: boolean;
        status?: UserStatus;
      };
    }
  }
}
```

### Why this exists (clear explanation)

TypeScript **does not know** about `req.user` by default.

We declare it globally so:

- Express `Request` type includes **authenticated user**
- Safe access across entire project
- Prevents **TypeScript errors**
- Enables **strong typing in controllers/services**

This is a **core TypeScript backend pattern**.

### in lib/auth.ts, add:

```ts
plugins: [bearer()];
```

---

# Route Protection Example

```ts
router.patch(
  "/:specialtyId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  specialtyController.updateSpecialty,
);
```

Meaning:

- Only **ADMIN / SUPER_ADMIN / DOCTOR**
- Can access this endpoint
- Others → **403 Forbidden**

> review ./src/app/modules/auth to see token generation during login/registration and setting them as cookies.

#### explanation of the user experience from the current setting as an example:

Your system uses a **Short Leash** (Browser Cookies) and a **Long Leash** (Database/JWT).

##### 1. The "Daily Routine" (The Seamless Experience)

The Action: User opens the app every morning.
The Code: `checkAuth` middleware sees the **AccessToken** (1-day life) is still in the browser.

- Experience: The user is "instantly in." No login screen, no lag.

##### 2. The "Silent Handshake" (The Token Rotation)

The Action: The user has been using the app for exactly 24 hours.
The Code: `getNewTokenService` is triggered. It checks the **RefreshToken** (7-day life).

- It gives the user a **brand new** AccessToken and a **brand new** RefreshToken.
- Experience: Totally invisible. The "7-day wall" is pushed back another week automatically. As long as they use the app daily, they stay logged in **forever**.

##### 3. The "Missing Day" (The Strict Security)

The Action: The user closes the app Friday night and doesn't open it until Sunday morning.
The Code: `tokenUtils` set the **Cookie Max-Age** to 24 hours.

- By Sunday, the browser has deleted the cookies.
- Experience: The user is forced to **Log In again**. Even though the Database says they are valid for 7 days, the "Key" in their browser expired because they didn't "ping" the server within the 24-hour window.

##### Which part of the code does what?

- **`lib/auth.ts`:** Sets the initial "Master" session length (30 days).
- **`auth.service.ts`:** Handles the "Infinite Loop" logic by resetting the DB expiry to 7 days every time a user is active.
- **`tokenUtils.ts`:** Acts as the **Strict Gatekeeper**. Its `maxAge: 24h` is the reason users must log in if they miss a single day.

#### Is this "Industry Standard"?

Yes! This is called Token Rotation.

Industry leaders (like Google or Facebook) use this exact logic. They don't want to annoy active users by logging them out every week. Instead, they say: "As long as you use our app regularly, we'll keep your keys fresh. We only force a login if you've been away so long that we're no longer sure it's actually you."

---

14. Email service with Nodemailer for OTP:
    install:
    npm i nodemailer
    npm i -D @types/nodemailer

    npm install ejs
    npm i -D @types/ejs

    create app-password from google:
    gtzi xxxx xxxx xxxx

    \*in .env:
    EMAIL_SENDER_SMTP_USER=mashrurkabirriyan@gmail.com
    EMAIL_SENDER_SMTP_PASS=gtzi xxxx xxxx xxxx #app-password
    EMAIL_SENDER_SMTP_HOST=smtp.gmail.com
    EMAIL_SENDER_SMTP_PORT=465
    EMAIL_SENDER_SMTP_FROM=mashrurkabirriyan@gmail.com

    \*update src\app\interfaces\envConfig.ts and src\config\env.ts accordingly

    \*create sendEmail function inside ./src/app/email.ts

    \*create otp.ejs inside ./src/app/templates.

    \*in lib/auth.ts, update (sample code, check the actual file for more functionalities added along):
    //....other configs
    plugins: [
    bearer(),
    emailOTP({
    overrideDefaultEmailVerification: true,
    async sendVerificationOTP({ email, otp, type }) {
    if (type === "email-verification") {
    const user = await prisma.user.findUnique({
    where: {
    email,
    },
    });
    if (user && !user.emailVerified) {
    sendEmail({
    to: email,
    subject: "Verify your email",
    templateName: "otp",
    templateData: {
    name: user.name,
    otp,
    },
    });
    }
    }
    },
    expiresIn: 2 * 60, //2 minutes
    otpLength: 6,
    }),
    ],

    \*make verify-email, forget-password, google-login and other necessary authentication and authorization routes in auth module

15. Google Login:
    \*go to google cloud > console > api and services > credentials > create credentials > oauth client id >

    application type: web application
    Name: PH-Healthcare-Backend
    add uri: http://localhost:5000
    redirect uri: http://localhost:5000/api/auth/callback/google

    -click create

    -copy and save the credentials inside your .env file. adjust the ./src/app/interface/envConfig.ts and ./src/config/env.ts accordingly:
    GOOGLE_CLIENT_ID=1048417100456-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx
    GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/callback/google
    FRONTEND_URL=http://localhost:3000 #dummy frontend for now

    \*update ./src/app/lib/auth.ts with necessary configurations

    \*make .ejs files for redirect, success, failure inside the ./src/app/templates folder

    \*in app.ts, at the very top, add:
    app.set("view engine", "ejs");
    app.set("views", path.resolve(process.cwd(), `src/app/templates`));

    \*make the routes, controllers and services for google login

    \*in browser: http://localhost:5000/api/v1/auth/login/google

    The "Flow":

    /login/google: This is the "Start" button. When a user clicks "Login with Google," your frontend sends them here. This route tells Better-Auth to build a special Google URL and redirect the user's browser to Google's login page.

    Google's Part: The user enters their Gmail credentials on Google's own site.

    The Callback: Google sends the user back to your server (specifically to the app.use("/api/auth", ...) handler you set in app.ts). Better-Auth catches this, verifies the user, creates them in your Prisma DB, and sets a session.

    /google/success: Once everything is finished, Better-Auth redirects the user to this "Success" route. Because Google login happens in a popup or a full-page redirect, we use this route to "talk" back to your Frontend (likely a React/Next.js app) to tell it, "Hey, they're logged in now!"

    /oauth/error: If the user cancels or Google is down, they land here so you can show a friendly "Something went wrong" message.

    Why We Use a Custom Google OAuth Flow?:
    This project implements a hybrid Google Login strategy using Better-Auth and custom Express routes to meet strict healthcare data requirements:

    Secure Redirection: Google login requires a browser-based redirect to their secure domain; our backend routes bridge the gap between your API, Google, and the frontend.

    Custom Role Management: Google only provides basic info (name/email); our custom flow intercepts the login to automatically assign required system fields like role: PATIENT and status: ACTIVE.

    Automated Profile Creation: Better-Auth only manages auth tables; our success route detects new Google users and instantly creates their corresponding Patient Profile in Prisma to ensure data synchronization.

    JWT Handshake: To support our Dual-Token System, these routes facilitate the "handshake" that converts a verified Google identity into our custom system's Access and Refresh tokens.

16. Cloudinary for image upload:
    install:
    npm i cloudinary

    npm i multer
    npm i -D @types/multer

    npm i multer-storage-cloudinary

    \*in .env, add:
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string

    -update ./src/app/interface/envConfig.ts and ./src/config/env.ts accordingly

    \*configure cloudinary:
    in ./src/app/config, create cloudinary.config.ts

    \*configure multer:
    in ./src/app/config, create multer.config.ts

    \*usage example:
    controller:
    router.post(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    specialtyController.createSpecialty,
    );

    \*update controller and validateRequest.ts middleware:
    const createSpecialty = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    // Add the Cloudinary URL from Multer to the payload
    if (req.file) {
    payload.icon = req.file.path;
    }
    //....business logic

    sendResponse(res, {
    .....
    });
    });

    middleware:
    const validateRequest = (schema: ZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
    try {
    // 1. Pre-parse: If data is a stringified JSON (common in Multer/Form-data)
    if (req.body.data && typeof req.body.data === "string") {
    req.body = JSON.parse(req.body.data);
    }
    // 2. Validate ONLY the content of req.body against the schema
    // This matches your: z.object({ title: z.string() })
    const result = await schema.parseAsync(req.body);

        // 3. Sanitize: Overwrite req.body with the cleaned data from Zod
        req.body = result;

        next();

    } catch (err) {
    // Pass the ZodError directly to your globalErrorHandler
    next(err);
    }
    };
    };

    why?:
    while using multipart/form-data in Postman, everything except the file is treated as a string. Your req.body.data is considered a raw string like "{ "title": "Gastroenterology" }" rather than a JavaScript object, which is why Prisma would complain that the title argument is missing.

    in postman:
    POST: http://localhost:5000/api/v1/specialties

    create specialty with icon-

    > under body: enable "form-data" instead of your usual raw json, then:
    > key = data
    > value = {"title": "Gastroenterology"}
    > under the "form-data" write "file" as another key,
    > select "file" as type
    > as its value, select a file (an image for example) from local machine

    \*create upload and delete functionalities (explain why\*\*) for flexibility inside cloudinary.config.ts

    \*explanation:
    1. Manual Control (cloudinary.config.ts):
       This file contains the logic for when you need to handle files programmatically in your services.

       uploadFileToCloudinary: It takes a raw Buffer (data in memory) and "streams" it to Cloudinary. This is memory-efficient because it doesn't save the file to your server's hard drive first. It also cleans up filenames (removes spaces/special characters) to make them URL-friendly.

       deleteFileFromCloudinary: It takes a full URL, uses Regex to extract the public_id, determines if the file is an image, video, or document (raw), and deletes it from your cloud storage.

    2. Automatic Integration (multer.config.ts):
       This file is your Middleware. It’s designed to sit directly on your Express routes.

       multerUpload: When a user sends a file via a form (multipart/form-data), this middleware intercepts it.

       Dynamic Routing: It automatically looks at the file type (MIME type) and sorts it into the correct Cloudinary folder (/images, /videos, or /documents) before your actual controller code even runs.

       Hands-off: You don't have to manually call "upload"; Multer and multer-storage-cloudinary handle the transit for you.

17. Query builder:
    install:
    npm i qs
    npm i -D @types/qs

    in top of app.ts:
    //query parser
    app.set("query parser", (str: string) => qs.parse(str));

    create ./app/utils/QueryBuilder.ts and its corresponding interface inside ./app/interfaces/query.interface.ts

    usage example inside app/modules/doctor/doctor.service.ts/getAllDoctorsFromDB():

    const getAllDoctorsFromDB = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<
    Doctor,
    Prisma.DoctorWhereInput,
    Prisma.DoctorInclude

    > (prisma.doctor, query, {
    > searchableFields: doctorSearchableFields,
    > filterableFields: doctorFilterableFields,
    > });

    const result = await queryBuilder
    .search()
    .filter()
    .where({
    isDeleted: false,
    })
    .include({
    user: true,
    // specialties: true,
    specialties: {
    include: {
    specialty: true,
    },
    },
    })
    .dynamicInclude(doctorIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

    console.log(result);
    return result;
    };

18. extra:

    \*install date-fns for date handling:
    install:
    npm install date-fns
    npm install -D @types/date-fns

    \*install uuid:
    npm i uuid @types/uuid

    \*install cron:
    npm i node-cron
    npm i -D @types/node-cron

    \*create seeding superAdmin file in ./app/utils/seed.ts
    add necessary credentials in .env and run in server.ts at the top:
    //seed admin first:
    await seedSuperAdmin();

19. Payment with Stripe:
    install stripe:
    npm install stripe

    \*add STRIPE_SECRET_KEY to .env
    update envConfig.ts and env.ts accordingly

    \*for webhook:
    stripe dashboard > add webhook endpoint > test with local listener

    (download strip cli if you havent already)

    in terminal: stripe login

    make script in package.json:
    "stripe:webhook": "stripe listen --forward-to localhost:5000/webhook",

    in app.ts:
    app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent,
    );
    );

    run:
    npm run stripe:webhook

    -paste webhook in .env as STRIPE_WEBHOOK_SECRET

    \*click add destinations in stripe dashboard:
    select events:
    search "payment" and check-
    -Occurs when a payment intent using a delayed payment method fails.
    -Occurs when a payment intent using a delayed payment method finally succeeds

    search "complete" and check-
    -Occurs when a Checkout Session has been successfully completed.
    -Occurs when a PaymentIntent has successfully completed payment.

    search "expired" and check-
    -Occurs when a Checkout Session is expired.

    click continue > webhook endpoint > enter the live link for endpoint url

    trigger events with cli:
    stripe trigger payment_intent.succeeded
