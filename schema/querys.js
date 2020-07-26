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
      resolve(parent, args) {
        return Message.find({});
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
