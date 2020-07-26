const graphql = require("graphql");
import { withFilter } from "apollo-server-express";
import { MessageType, UpdateChatType, UserType, ProfileType } from "./types";

import {
  UPDATE_CHAT,
  NEW_MESSAGE,
  DELETE_MESSAGE,
  NEW_USER,
  UPDATE_PROFILES,
  ADD_ONLINE_USER,
} from "./constants";

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

const SubscriptionType = new GraphQLObjectType({
  name: "Subscription",
  fields: {
    newMessage: {
      type: MessageType,
      subscribe: (parent, args, context) =>
        context.pubsub.asyncIterator([NEW_MESSAGE]),
    },
    deleteMessage: {
      type: MessageType,
      subscribe: (parent, args, context) =>
        context.pubsub.asyncIterator([DELETE_MESSAGE]),
    },
    updateChat: {
      type: UpdateChatType,
      subscribe: (parent, args, context) =>
        context.pubsub.asyncIterator([UPDATE_CHAT]),
    },
    addOnlineUser: {
      type: UserType,
      subscribe: (parent, args, context) =>
        context.pubsub.asyncIterator([ADD_ONLINE_USER]),
    },
    newUser: {
      type: UserType,
      subscribe: (parent, args, context) =>
        context.pubsub.asyncIterator([NEW_USER]),
    },
    profilesUpdate: {
      type: new GraphQLList(ProfileType),
      subscribe: (parent, args, context) =>
        context.pubsub.asyncIterator([UPDATE_PROFILES]),
    },
  },
});

export default SubscriptionType;
