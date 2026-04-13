# GraphQL + Node.js + Prisma Server Setup 🚀

This repository is a solid, production-ready foundation for building a GraphQL API using Node.js, TypeScript, Apollo Server, and Prisma. 

This README serves as both a documentation for the project and a revision notes guide for learning industry-standard backend development with GraphQL.

---

## 🏗️ Architecture & Folder Structure

This project follows a **Modular / Domain-Driven Design (DDD)** approach combined with a **Clean Composition Root** pattern.

### The Composition Root Pattern
Instead of a messy, flat structure, we use a single entry point for all GraphQL definitions.
- **Domain Modules:** Every feature (like `user` or `post`) lives in its own folder.
- **Barrel Exports:** Each folder has an `index.ts` that *only* exports the domain's types and resolvers.
- **Root Index:** `src/graphql/index.ts` imports all modules, defines the `baseTypeDefs`, and stitches everything together into one final schema for Apollo Server.

### Folder Breakdown

```text
/server
├── prisma/                 # 🗄️ Database Layer
│   └── schema.prisma       # Single source of truth for DB tables
├── src/
│   ├── services/           # 🧠 Business Logic Layer (The "Fat" Service)
│   │   └── user.ts         # Logic for passwords, hashing, JWTs, etc.
│   └── graphql/            # 🌐 API Layer (The "Thin" Controllers)
│       ├── index.ts        # Composition Root: Merges all modules together
│       ├── server.ts       # Apollo Server setup & JWT Auth Context logic
│       ├── [domain]/       # Modular feature folders (e.g., user, post)
│       │   ├── schema.ts   # GraphQL TypeDefs (definitions of types/queries)
│       │   ├── query.ts    # Read-only resolvers
│       │   ├── mutation.ts # Write/Action resolvers (Auth guarded)
│       │   ├── resolver.ts # Combines Query + Mutation for the domain
│       │   └── index.ts    # Barrel Export: Hands off domain pieces to the root
```

---

## 📚 GraphQL Basics (For Revision)

If you are new to GraphQL, here is how this project maps the core concepts:

### 1. Schema (The "Contract")
Defined in `schema.ts` files. It defines exactly what data can be requested.
- **Types:** Represent objects (e.g., `type User { id: Int! email: String! }`).
- **Query:** Defines entry points for *reading* data.
- **Mutation:** Defines entry points for *changing* data (Create, Update, Delete).

### 2. Resolvers (The "Execution")
Defined in `query.ts` and `mutation.ts`. These are the functions that actually fetch the data. In this project, they act as "Thin Controllers" that simply call a function inside a **Service**.

### 3. TypeDefs vs. Resolvers
- **TypeDefs:** The *Interface* (What can I do?).
- **Resolvers:** The *Implementation* (How do I actually do it?).

### 4. Directives (e.g., `extend`)
In `schema.ts`, we use `extend type Query` so that every module can add its own queries to the global list without conflicting with other files.

---

### Why is this scalable? (The "Thin Resolver, Fat Service" Pattern)
In a beginner's app, developers put all their database logic inside their GraphQL resolvers. **You did not do this.** 
You made your resolvers "thin" (they just receive the payload and pass it to a service) and your services "fat" (the `UserService` handles hashing, DB queries, etc.). This means if you ever want to build a REST API next to your GraphQL API, you can just reuse `UserService` without changing the logic!

---

## 🛠️ Step-by-Step Setup

1. **Start the Database (Docker)**
   Start the PostgreSQL container defined in `docker-compose.yaml`.
   ```bash
   docker-compose up -d
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Ensure your `.env` file contains:
   ```env
   DATABASE_URL="postgresql://threads:threads@127.0.0.1:5434/graphql_db"
   JWT_SECRET="your_jwt_secret"
   ```

4. **Run Database Migrations & Generate Prisma Client**
   Apply the current schema to your DB and generate TypeScript definitions.
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

---

## 🧠 Core Functions & Concepts (Notes)

### 1. The Context & Authentication (`src/graphql/server.ts`)
When a request comes in, the server immediately intercepts it inside the `context` function.
- It looks for the `Authorization: Bearer <token>` header.
- It uses `jwt.verify` to make sure the token is legitimate.
- If valid, it fetches the user from the database (`prisma.user.findUnique`) and attaches them to the `context`.
- **Result:** Every single query and mutation downstream has access to `context.user` to see who is logged in!

### 2. User Service (`src/services/user.ts`)
This class contains the static methods that perform the heavy lifting.
- **`createUser(payload)`:** 
  It secures passwords using Node's native `crypto` module. It generates a random 16-byte `salt`, hashes the password with `createHmac("sha256")`, and stores both the `salt` and `hashedPassword` in Postgres. *This is an extremely secure way to store passwords.*
- **`getUserToken(payload)`:**
  Finds the user by email, retrieves their unique `salt`, and hashes the inputted password to see if it matches the DB record. If it matches, it signs and returns a payload using `jsonwebtoken` (Valid for 1 hour).

### 3. Modular GraphQL Definitions (`src/graphql/user/*`)
- **`schema.ts`**: Uses Apollo's `#graphql` syntax highlighting to define the exact shape of your data (`type User`), queries (`getUserToken`), and mutations (`createUser`). Note how we use `extend type Query` so we can dynamically stitch multiple modules together later.
- **`query.ts` & `mutation.ts`**: These simply act as traffic cops. For example, `createUser` receives a request, hands the payload safely to `UserService.createUser()`, and returns the result back to Apollo.
- **`resolver.ts`**: Groups everything from the user module together into one tidy exported object.

---

## 🔮 Future Improvements / Next Steps
Your setup is 95% perfect for a production app. To take it to 100%, consider:
1. **Dataloaders / N+1 Avoidance:** As you add relational entities (like "Posts" belonging to a "User"), look into the `dataloader` pattern so Prisma doesn't make 100 queries when fetching 100 users.
2. **Custom Error Handling:** Using Apollo's `GraphQLError` class to send standardize HTTP 400/401/403 status codes instead of standard `Error()`.
3. **Validation:** Use `zod` inside your Services to validate email formats and password strengths before inserting into the DB.

---

## 🧵 Post / Thread API (Threads by Meta Clone)

This project implements a full **threaded post system** mimicking Meta's Threads application. A post is recursive — it can either be a root thread or a reply to another post.

### Updated Folder Structure (Post Module)

```text
src/
├── services/
│   ├── user.ts          # (existing) User auth logic
│   └── post.ts          # (NEW) All post CRUD + reply logic
└── graphql/
    ├── index.ts         # (UPDATED) Merges User + Post modules
    └── post/            # (NEW) Post domain module
        ├── schema.ts    # GraphQL types, queries, mutations for Post
        ├── query.ts     # Thin resolvers for reading posts
        ├── mutation.ts  # Auth-guarded resolvers for write operations
        ├── resolver.ts  # Combines query + mutation
        └── index.ts     # Barrel export
```

### Prisma Data Model

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  content   String
  imageURL  String?
  authorId  Int                    // FK → User
  parentId  Int?                   // null = root thread | Int = reply to that post
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author  User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent  Post?  @relation("Replies", fields: [parentId], references: [id], onDelete: Cascade)
  replies Post[] @relation("Replies")   // recursive self-join
}
```

> **Key concept — Self-referencing relation:** `parent` and `replies` both point to the same `Post` model.
> This is how you build nested threads without needing a separate table. When a `Post` is deleted, all its replies cascade-delete automatically.

### GraphQL Operations

#### 📖 Queries (No auth required)

| Query | Args | Returns | Description |
|---|---|---|---|
| `getAllPosts` | — | `[Post!]!` | All root threads, newest first, with replies eager-loaded |
| `getPostById` | `postId: Int!` | `Post` | Single thread with its full reply chain |
| `getPostsByUser` | `userId: Int!` | `[Post!]!` | All posts by a specific user |

#### ✍️ Mutations (Auth required — send `Authorization: Bearer <token>` header)

| Mutation | Args | Returns | Description |
|---|---|---|---|
| `createPost` | `content: String!, imageURL?: String, parentId?: Int` | `Post!` | Create a root thread or reply (pass `parentId` to reply) |
| `updatePost` | `postId: Int!, content?: String, imageURL?: String` | `Post!` | Edit your own post. Throws `FORBIDDEN` if not the author |
| `deletePost` | `postId: Int!` | `Boolean!` | Delete your own post + all its replies via cascade |

### Example GraphQL Queries

**Create a root thread:**
```graphql
mutation {
  createPost(content: "Hello Threads! 👋") {
    id
    content
    author { firstName lastName }
    createdAt
  }
}
```

**Reply to a post:**
```graphql
mutation {
  createPost(content: "Great point!", parentId: 1) {
    id
    content
    parentId
  }
}
```

**Fetch all threads with replies:**
```graphql
query {
  getAllPosts {
    id
    content
    author { firstName lastName }
    replies {
      id
      content
      author { firstName lastName }
    }
    createdAt
  }
}
```

**Delete a post (only your own):**
```graphql
mutation {
  deletePost(postId: 3)
}
```

### How Auth Works in Post Mutations

The `context` object in `server.ts` verifies the JWT from `Authorization: Bearer <token>` header and attaches the `user` object to every request. The `requireAuth()` guard in `mutation.ts` then checks for this:

```
Client → sends JWT in header
  → server.ts context() verifies token → attaches { user } to context
    → mutation resolver calls requireAuth(context)
      → if context.user is null → throws UNAUTHENTICATED error
      → if context.user.id ≠ post.authorId → throws FORBIDDEN error
```

