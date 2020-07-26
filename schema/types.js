const graphql = require("graphql");

import User from "../models/user";
import Message from "../models/message";

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

export const MessageType = new GraphQLObjectType({
  name: "messages",
  fields: () => ({
    _id: {
      type: GraphQLID,
    },
    text: {
      type: GraphQLString,
    },
    createdAt: {
      type: GraphQLString,
    },
    usersId: {
      type: GraphQLID,
    },
    usersUsername: {
      type: GraphQLString,
    },
    users: {
      type: UserType,
      resolve: (parent, args) => {
        let user = User.findOne().or(
          { _id: parent.usersId },
          { username: parent.usersUsername }
        );
        return user;
      },
    },
  }),
});

export const UserType = new GraphQLObjectType({
  name: "users",
  fields: () => ({
    _id: {
      type: GraphQLID,
    },
    username: {
      type: GraphQLString,
    },
    userType: {
      type: GraphQLInt,
    },
    lastseen: {
      type: GraphQLString,
    },
    token: {
      type: GraphQLString,
    },
    messages: {
      type: new GraphQLList(MessageType),
      resolve: async (parent, args) => {
        const messages = await Message.find({
          usersId: parent._id,
        });
        return messages;
      },
    },
  }),
});

export const UpdateChatType = new GraphQLObjectType({
  name: "updatechat",
  fields: () => ({
    messageId: {
      type: GraphQLString,
    },
    message: {
      type: MessageType,
    },
    mutationType: {
      type: GraphQLString,
    },
  }),
});

export const ProfileType = new GraphQLObjectType({
  name: "profile",
  fields: () => ({
    user: {
      type: UserType,
    },
    status: {
      type: GraphQLString,
    },
    lastLogin: {
      type: GraphQLString,
    },
  }),
});
