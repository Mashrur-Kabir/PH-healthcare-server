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

# Global Type Declaration

Create:

```
./app/types/index.d.ts
```

### Why this exists (clear explanation)

TypeScript **does not know** about `req.user` by default.

We declare it globally so:

- Express `Request` type includes **authenticated user**
- Safe access across entire project
- Prevents **TypeScript errors**
- Enables **strong typing in controllers/services**

This is a **core TypeScript backend pattern**.

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

---

11. Environment variable configuration:
    create /config/env.ts inside ./src:
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

    -in server.ts, change:
    const PORT = envVars.PORT;

    -in prisma.config.ts, change:
    datasource: {
    url: envVars.DATABASE_URL,
    },

    -in ./app/lib/prisma.ts, change:
    const connectionString = envVars.DATABASE_URL;

12. Zod validation:
    to improve performance by not letting payload validation reach database layer. we validate them in server (explain better\*\*):

        install:
        npm i zod

        \*define zod schema:
        inside ./app/middleware, create validateRequest.ts:
        import { NextFunction, Request, Response } from "express";
        import { ZodObject } from "zod";

        const validateRequest = (schema: ZodObject) => {
        return async (req: Request, res: Response, next: NextFunction) => {
        try {
        // Parse the request against the schema
        // This checks req.body, req.query, and req.cookies if defined in schema
        const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
        });

        req.body = result.body;
        next();
        } catch (err) {
        // If validation fails, pass the Zod error to the global error handler
        next(err);
        }

        };
        };

        export default validateRequest;

        now, you can define .validation.ts files inside the modules according to your needs. example:

        doctor.validation.ts:

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
        .partial() //use optional() when there is a "must-update" field
        .strict(),
        });

        export const doctorValidation = {
        updateDoctorSchema,
        };

        use as:
        router.patch(
        "/:id",
        validateRequest(doctorValidation.updateDoctorSchema),
        doctorController.updateDoctor,
        );

13. JWT
    we need a session token (one that gets returned with the data after user logs in and stored in better-auth session) to authenticate the user. we need another token that helps us understand user roles for authorization purposes (RBAC).
    Access token, Refresh token will be sent from backend. (explain this part better and more precisely and say why we need jwt\*\*)

    install:
    npm i jsonwebtoken
    npm i -D @types/jsonwebtoken
    npm i cookie-parser
    npm i -D @types/cookie-parser

    \*create jwt.ts, token.ts, cookie.ts inside ./app/utils with proper cookie and token utility functions.

    \*in .env, add:
    ACCESS_TOKEN_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx
    REFRESH_TOKEN_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx
    ACCESS_TOKEN_EXPIRES_IN=xxd
    REFRESH_TOKEN_EXPIRES_IN=xxd
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN=xxd
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE=xxd

    \*generate access and refresh token via environment terminal:
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

    \*update src\config\env.ts accordingly.

    \*in app/lib/auth.ts, add:

    session: {
    expiresIn: Number(
    ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue),
    ),
    updateAge: Number(
    ms(envVars.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as StringValue),
    ),
    cookieCache: {
    enabled: true,
    maxAge: Number(
    ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue),
    ),
    },
    },

    \*update auth.controller.ts and auth.service.ts (./app/modules/auth) to create the tokens and cookies after verification.
    (review the update.)

    the tokens:
    1. The Better-Auth Session Token (token)
       What it is: A random string (Opaque Token) generated by the Better-Auth library.
       How it works: It acts as a "Claim Check." When the server receives this string, it goes to your database (Prisma Session table) to see if a session exists with that ID.
       Why it's there: Better-Auth uses this to manage things like "Sign out from all devices," session expiration, and security metadata (IP address, user agent).
    2. The Access Token (accessToken)
       What it is: A JWT (JSON Web Token) that you manually created using jwt.ts.
       How it works: It is "Stateless." The server doesn't need to check the database to know who you are. It just looks at the digital signature on the token.
       Why it's there: You use this for your custom middleware to quickly verify if a user has the right Role (e.g., DOCTOR or ADMIN) without hitting the database every single time.
    3. The Refresh Token (refreshToken)
       What it is: Also a JWT created by you.
       How it works: It lives longer and is used solely to generate a new accessToken once the current one dies.

    \*add inside app.ts:
    app.use(cookieParser()); //to parse cookies

    \*create ./app/middleware/authMiddleware.ts. create the authorization and token expiration logic inside this file.

    explanation of the file content:
    1. The Gatekeeper: Verify Access Token (JWT)
       The very first thing your code does is grab the accessToken from the cookie. This is a stateless check. By using jwtHelpers.verifyToken, you ensure the digital signature is valid before even talking to your database. If a hacker sends a fake token, the request dies here, saving your database from unnecessary work.

    2. The Truth Layer: Manual Session Verification
       Instead of relying on the library to "interpret" the request, you take the better-auth.session_token and look it up directly in your Prisma Session table. This ensures the session exists, belongs to a real user, and—most importantly—has not passed its expiresAt date.

    3. The Security Audit: User Status Checks
       Once the session is confirmed, you check the User record attached to it. This is your "kill switch." Even if a user has a valid session, if an Admin has Blocked them or Deleted their account in the last few seconds, this check will catch it and revoke their access instantly.

    4. The Smart Hint: Expiry Warning Headers
       You perform a quick calculation to see how much "life" is left in the session. If it’s less than 20%, you don't stop the request, but you attach an X-Session-Refresh header. This acts as a "low fuel" light for your frontend, telling it to trigger a background refresh so the user doesn't get kicked out mid-action.

    5. The Context Bridge: Global req.user Attachment
       You take the verified data from the database and "mount" it onto the Express req object. Because you set up your index.d.ts globally, this information is now available to every Service and Controller later in the chain. You’ve effectively identified the user for the rest of the request’s life.

    6. The Final Guard: Role Authorization
       Lastly, you compare the Role[] array (the required roles for that route) against the user’s actual role. If your route is protected for ADMIN but the user is a PATIENT, you throw a 403 Forbidden. The request is only allowed to proceed to the Controller if the user passes this final check.

    \*create ./app/types/index.d.ts for the sessions' user type definitions inside the middleware. Inside, declare global inside index.d.ts is for OUTPUT: It tells TypeScript how to store that data inside the Express req object for the rest of your app to use. (explain this part better\*\*)

    \*usage example (route protection):
    router.patch(
    "/:specialtyId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
    specialtyController.updateSpecialty,
    );
