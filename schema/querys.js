const graphql = require("graphql");

import User from "../models/user";
import Message from "../models/message";

import { validateToken } from "../services/auth";

import { MessageType, UpdateChatType, UserType } from "./types";

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

const RootQueryType = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    message: {
      type: MessageType,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      resolve: async (parent, args) => {
        return Message.findById(args.id);
      },
    },
    messages: {
      type: new GraphQLList(MessageType),
      args: {
        sort: { type: GraphQLString },
        username: { type: GraphQLString },
        createdAt: { type: GraphQLString },
      },
      resolve: async (parent, { sort, username, createdAt }) => {
        let query = Message.find({}).sort({
          createdAt: sort ? sort : "asc",
        });

        if (username) {
          query = query.where({ usersUsername: username });
        }

        if (createdAt) {
          const dt = new Date(`${createdAt}:00:00`);
          const dateFilter = new Date(dt);
          const dateLimit = new Date(dt.setDate(dt.getDate() + 1));

          query = query.where({
            createdAt: {
              $gte: Math.floor(dateFilter / 1000),
              $lt: Math.floor(dateLimit / 1000),
            },
          });
        }
        return query;
      },
    },
    user: {
      type: UserType,
      args: {
        id: {
          type: GraphQLID,
        },
        username: {
          type: GraphQLString,
        },
      },
      resolve(parent, args) {
        return User.findOne().or([
          { _id: args.id },
          { username: args.username },
        ]);
      },
    },
    currentUser: {
      type: UserType,
      resolve: async (parent, args, context) => {
        try {
          if (!context.token) throw new Error("Token não foi enviado");
          const user = await validateToken(context.token);

          return user;
        } catch (err) {
          throw err;
        }
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({});
      },
    },
  },
});

export default RootQueryType;
