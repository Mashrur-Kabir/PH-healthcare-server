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

Perfect.
We continue the README in the **same production-grade style**,
**no explanation removed**, and every `explain **` section expanded properly and clearly.

---

# 14. Email Service with Nodemailer (OTP Verification System)

## Why Email OTP is Needed (Full Explanation)

Email OTP (One-Time Password) is used to:

- Verify a user's email during registration
- Secure password reset flow
- Prevent fake account creation
- Add a second layer of security

In healthcare systems, verifying identity is **critical**.
Unverified accounts could:

- Book fake appointments
- Access sensitive patient data
- Exploit authentication endpoints

So OTP verification becomes a **mandatory security layer**, not optional.

---

## Install Dependencies

```bash
npm i nodemailer
npm i -D @types/nodemailer

npm install ejs
npm i -D @types/ejs
```

### Why we need them

- **Nodemailer** → sends emails via SMTP
- **EJS** → allows dynamic HTML email templates
- `@types/*` → TypeScript support

---

### Step 1: Create Gmail App Password

Go to:

Google Account → Security → App Passwords

Generate a 16-character password like:

```
gtzi xxxx xxxx xxxx
```

⚠️ Never use your real Gmail password.
Always use App Password for production security.

---

### Step 2: Add Environment Variables

Add inside `.env`:

```
EMAIL_SENDER_SMTP_USER=mashrurkabirriyan@gmail.com
EMAIL_SENDER_SMTP_PASS=gtzi xxxx xxxx xxxx
EMAIL_SENDER_SMTP_HOST=smtp.gmail.com
EMAIL_SENDER_SMTP_PORT=465
EMAIL_SENDER_SMTP_FROM=mashrurkabirriyan@gmail.com
```

---

### Step 3: Update Environment Types

Update:

```
src/app/interfaces/envConfig.ts
src/config/env.ts
```

Add:

```ts
EMAIL_SENDER_SMTP_USER: string;
EMAIL_SENDER_SMTP_PASS: string;
EMAIL_SENDER_SMTP_HOST: string;
EMAIL_SENDER_SMTP_PORT: string;
EMAIL_SENDER_SMTP_FROM: string;
```

Why this matters:

- Prevents runtime crashes
- Ensures required email config is always present
- Keeps config strictly typed

---

### Step 4: Create Email Utility

Create:

```
./src/app/email.ts
```

This file:

- Configures SMTP transporter
- Loads EJS template
- Sends email dynamically

This centralizes email logic in one place —
so any future SMS/email provider switch is easy.

---

### Step 5: Create OTP Template

Create:

```
./src/app/templates/otp.ejs
```

Why use EJS?

Instead of sending plain text:

```
Your OTP is 123456
```

We send styled HTML email with:

- User name
- OTP
- Expiry info
- Branding

This improves:

- User trust
- Professional feel
- Deliverability score

---

### Step 6: Integrate with Better-Auth

Inside `lib/auth.ts`:

```ts
plugins: [
  bearer(),
  emailOTP({
    overrideDefaultEmailVerification: true,
    async sendVerificationOTP({ email, otp, type }) {
      if (type === "email-verification") {
        const user = await prisma.user.findUnique({
          where: { email },
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
    expiresIn: 2 * 60, // 2 minutes
    otpLength: 6,
  }),
],
```

---

#### Why This Override is Important (Deep Explanation)

By default, Better-Auth sends basic verification.

We override it because:

- We want branded email templates
- We want control over subject and design
- We may add logging, rate limiting, or analytics later

This keeps your system enterprise-ready.

---

### Make Required Routes

Inside auth module create:

- verify-email
- forget-password
- reset-password
- resend-otp
- google-login
- logout
- refresh-token

Each route:

- Validates input with Zod
- Uses service layer
- Returns standardized response

---

# 15. Google Login (OAuth 2.0 Integration)

### Step 1: Create Google OAuth Credentials

Go to:

Google Cloud Console → APIs & Services → Credentials → Create Credentials → OAuth Client ID

Choose:

- Application Type: Web Application
- Name: PH-Healthcare-Backend

Add:

```
Authorized JavaScript Origin:
http://localhost:5000

Authorized Redirect URI:
http://localhost:5000/api/auth/callback/google
```

Click Create.

---

### Step 2: Add to `.env`

```
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/callback/google
FRONTEND_URL=http://localhost:3000
```

Update:

```
envConfig.ts
env.ts
```

---

### Step 3: Configure Better-Auth

Update:

```
./src/app/lib/auth.ts
```

Add Google provider config.

---

### Step 4: Setup EJS for OAuth Flow

Create templates:

```
redirect.ejs
success.ejs
failure.ejs
```

---

### Step 5: Configure Express

At top of `app.ts`:

```ts
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));
```

---

## The Complete Google Login Flow (Clear Breakdown)

### 1 `/login/google`

Frontend sends user here.

Backend redirects user to Google login page.

---

### 2 Google Authentication

User logs in at Google.

We never see password.

---

### 3 Callback

Google redirects to:

```
/api/auth/callback/google
```

Better-Auth:

- Verifies token
- Creates user in Prisma
- Creates session

---

### 4 `/google/success`

Better-Auth redirects here.

We:

- Generate Access Token
- Generate Refresh Token
- Send cookies
- Redirect to frontend

---

### 5 `/oauth/error`

If login fails → user lands here.

---

## Why We Use Custom Google OAuth Flow (Important Explanation)

This healthcare project requires strict compliance.

### 1. Secure Redirection

Google requires browser-based redirect.
Our backend acts as bridge between:

Frontend ↔ Google ↔ Backend

---

### 2. Custom Role Assignment

Google only provides:

- name
- email

We automatically assign:

```
role: PATIENT
status: ACTIVE
```

---

### 3. Automated Profile Creation

Better-Auth manages only auth tables.

We:

- Detect new user
- Automatically create Patient profile
- Sync data

Prevents inconsistent records.

---

### 4. JWT Handshake

Google verifies identity.

But we use custom:

- Access Token
- Refresh Token

So we convert Google session → our JWT system.

This keeps consistency across login types.

---

# 16. Cloudinary (Image Upload System)

## Install

```bash
npm i cloudinary
npm i multer
npm i -D @types/multer
npm i multer-storage-cloudinary
```

---

## Add to `.env`

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Update:

- envConfig.ts
- env.ts

---

## Configure Cloudinary

Create:

```
./src/app/config/cloudinary.config.ts
```

---

## Configure Multer

Create:

```
./src/app/config/multer.config.ts
```

---

## Route Usage Example

```ts
router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  specialtyController.createSpecialty,
);
```

---

## Controller Update

```ts
if (req.file) {
  payload.icon = req.file.path;
}
```

---

## Update validateRequest Middleware

```ts
if (req.body.data && typeof req.body.data === "string") {
  req.body = JSON.parse(req.body.data);
}
```

---

## Why This Is Needed (Important Explanation)

When using `multipart/form-data`:

Everything except file becomes a string.

So:

```
{ "title": "Gastroenterology" }
```

Is treated as:

```
"{ \"title\": \"Gastroenterology\" }"
```

Without parsing → Prisma sees no title → error.

This fix ensures:

- Proper parsing
- Clean validation
- No Prisma crashes

---

## Postman Usage

POST → `http://localhost:5000/api/v1/specialties`

Body → form-data

Key:

```
data
```

Value:

```
{"title":"Gastroenterology"}
```

Add another key:

```
file
```

Type: File

Select image.

---

## Why We Created Manual Upload & Delete Functions (Deep Explanation)

### 1️⃣ Manual Control (cloudinary.config.ts)

Used when:

- Updating image
- Deleting old image
- Handling raw buffers
- Background processing

Functions:

- uploadFileToCloudinary
- deleteFileFromCloudinary

Advantages:

- Memory efficient
- No local file saving
- Clean filename handling
- Automatic public_id extraction

---

### 2️⃣ Automatic Integration (multer.config.ts)

Middleware-based.

When route receives file:

- Automatically uploads to correct folder
- Categorizes by MIME type
- No manual call required

---

This gives flexibility:

- Middleware upload
- OR manual upload in service

Enterprise-ready design.

---

# 17. Query Builder (Advanced Filtering System)

## Install

```bash
npm i qs
npm i -D @types/qs
```

---

## Update app.ts

```ts
app.set("query parser", (str: string) => qs.parse(str));
```

Why?

Default Express cannot handle nested query like:

```
?filter[name]=john&sort=-createdAt
```

qs enables advanced parsing.

---

## Create:

```
./app/utils/QueryBuilder.ts
./app/interfaces/query.interface.ts
```

---

## Usage Example

```ts
const result = await queryBuilder
  .search()
  .filter()
  .where({ isDeleted: false })
  .include({
    user: true,
    specialties: {
      include: { specialty: true },
    },
  })
  .dynamicInclude(doctorIncludeConfig)
  .paginate()
  .sort()
  .fields()
  .execute();
```

---

## Why Query Builder is Powerful (Important Explanation)

Instead of writing:

- search logic
- filter logic
- sort logic
- pagination logic

In every service…

We centralize it once.

Benefits:

- Clean services
- Reusable
- Scalable
- Enterprise-grade querying

---

# 18. Stripe Payment Integration

## Install

```bash
npm install stripe
```

Add to `.env`:

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## Webhook Setup

Stripe Dashboard → Add Webhook Endpoint

Install Stripe CLI:

```bash
stripe login
```

Add script:

```json
"stripe:webhook": "stripe listen --forward-to localhost:5000/webhook"
```

---

## app.ts

```ts
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent,
);
```

---

Run:

```
npm run stripe:webhook
```

Copy webhook secret → paste into `.env`.

---

## Select Stripe Events

Search and select:

- payment_intent.succeeded
- payment_intent.failed
- checkout.session.completed
- checkout.session.expired

---

## Testing

```
stripe trigger payment_intent.succeeded
```

---

## Why Webhooks Are Critical (Explanation)

Stripe redirects user after payment.

But redirect alone is not secure.

Webhook:

- Confirms payment server-to-server
- Prevents fake success response
- Updates appointment status
- Ensures payment integrity

This is mandatory for real systems.

---

# 19. Extra Utilities (Explain Usage)

---

## date-fns

For:

- Formatting appointment time
- Comparing dates
- Calculating expiry

---

## uuid

For:

- Unique invoice numbers
- Transaction references
- Secure identifiers

---

## node-cron

For:

- Auto-cancel unpaid appointments
- Send reminders
- Clean expired sessions

---

## pdfkit

For:

- Generating payment invoices
- Medical reports
- Appointment receipts

See:

```
./app/modules/payment/payment.service.ts
./app/modules/payment/payment.utils.ts
```

---

# Super Admin Seeding

Create:

```
./app/utils/seed.ts
```

Why?

System must always have:

- One SUPER_ADMIN
- With secure credentials

Without it:

No one can manage roles.

---

Add in `server.ts` (top):

```ts
await seedSuperAdmin();
```

This ensures:

- First deployment always creates admin
- No manual DB insert required
- Production safe bootstrap

---
