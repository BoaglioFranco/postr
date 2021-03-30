import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { COOKIE_NAME, __prod__ } from "./constants";

import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

// import cors from "cors";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/Loaders/createUserLoader";
import { createUpdootLoader } from "./utils/Loaders/createUpdootLoader";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "postr",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post, Updoot],
  });
  // await conn.runMigrations();

  const app = express();

  //CORS didnt work for me, had to use apollo middleware

  ///////REDIS SETUP
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      },
      saveUninitialized: false,
      secret: "doooooooooooooubuenardo",
      resave: false,
    })
  );

  /////////APOLLO
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(), //Batches and catches fetching of users on every request. (Context gets (re)created every request)
      updootLoader: createUpdootLoader()
    }), //Context is an object that is available within all resolvers. It automatically injects req/res when you're using express
  });

  //initializes graphql endpoint
  apolloServer.applyMiddleware({
    app: app,
    cors: { origin: "http://localhost:3000", credentials: true },
  });

  app.listen(4000, () => {
    console.log("Server started on port 4000");
  });
};

main().catch((err) => {
  console.error(err);
});
