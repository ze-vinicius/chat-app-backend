const express = require("express");
const bodyParser = require("body-parser");
const mongo = require("mongoose");
const cors = require("cors");
const { ApolloServer } = require("apollo-server");
import { PubSub, withFilter } from "apollo-server-express";

import User from "./models/user";

import jwt, { decode } from "jsonwebtoken";

import { validateToken } from "./services/auth";

const schema = require("./schema/schema");
const pubsub = new PubSub();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = new ApolloServer({
  schema,
  context: ({ req, connection }) => {
    if (connection) {
      return { ...connection.context, pubsub };
    } else {
      const token = req.headers.authorization || "";
      return { token, pubsub };
    }
  },
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      const userPromise = new Promise((resolve, reject) => {
        if (connectionParams.authorization) {
          jwt.verify(
            connectionParams.authorization,
            "mysecret",
            (err, decoded) => {
              if (err) {
                reject(new Error("Token inválido"));
              }
              resolve(User.findById(decoded.id));
            }
          );
        } else {
          reject(new Error("Não recebemos o token de autenticação"));
        }
      });
      return userPromise.then((user) => {
        if (user) {
          return { user: Promise.resolve(user) };
        }
        return Promise.reject(new Error("Usuário inválido"));
      });
    },
  },
});

mongo.connect("mongodb://localhost:27017/chat-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
