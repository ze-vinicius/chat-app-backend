const graphql = require("graphql");
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Message from "../models/message";

import { validateToken } from "../services/auth";

import {
  UPDATE_CHAT,
  NEW_MESSAGE,
  DELETE_MESSAGE,
  NEW_USER,
  CREATE,
  UPDATE,
  DELETE,
  ADD_ONLINE_USER,
} from "./constants";

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

import {} from "./schema";

const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    signUp: {
      type: UserType,
      args: {
        username: {
          type: new GraphQLNonNull(GraphQLString),
        },
        password: {
          type: new GraphQLNonNull(GraphQLString),
        },
        userType: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: async (parent, args, context) => {
        try {
          const { username, password, userType } = args;
          const existingUser = await User.findOne({ username });

          if (existingUser) {
            throw new Error("Uma conta com esse nome de usuário já existe");
          }

          const hashedPassword = await bcryptjs.hash(password, 10);

          let user = new User({
            username,
            password: hashedPassword,
            userType,
          });

          const newUser = await user.save();

          context.pubsub.publish(NEW_USER, { newUser: newUser });

          const token = jwt.sign({ id: newUser._id }, "mysecret");

          return { token, password: null, ...user._doc };
        } catch (err) {
          throw err;
        }
      },
    },
    signIn: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, context) => {
        try {
          const { username, password } = args;

          const existingUser = await User.findOne({
            username,
          });

          if (!existingUser) {
            throw new Error("Username incorreto");
          }

          const comparePassword = await bcryptjs.compare(
            password,
            existingUser.password
          );

          if (comparePassword) {
            const token = jwt.sign({ id: existingUser._id }, "mysecret");
            return { token, password: null, ...existingUser._doc };
          } else {
            throw new Error("Senha incorreta");
          }
        } catch (err) {
          throw err;
        }
      },
    },
    updateLastSeen: {
      type: UserType,
      resolve: async (parent, args, context) => {
        try {
          const user = await validateToken(context.token);

          const updatedUser = User.findByIdAndUpdate(
            user._id,
            {
              lastseen: Math.floor(Date.now() / 1000),
            },
            { useFindAndModify: false }
          );

          context.pubsub.publish(ADD_ONLINE_USER, {
            addOnlineUser: updatedUser,
          });

          return updatedUser;
        } catch (error) {
          throw error;
        }
      },
    },
    sendMessage: {
      type: MessageType,
      args: {
        text: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (parent, args, context) => {
        try {
          if (context.token) {
            const user = await validateToken(context.token);

            let message = new Message({
              text: args.text,
              usersId: user._id,
              usersUsername: user.username,
            });

            const newMessage = await message.save();

            context.pubsub.publish(UPDATE_CHAT, {
              updateChat: {
                message: newMessage,
                mutationType: CREATE,
              },
            });

            return newMessage;
          } else {
            throw new Error("Usuário não autenticado");
          }
        } catch (err) {
          throw err;
        }
      },
    },
    deleteMessage: {
      type: MessageType,
      args: {
        messageId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, context) => {
        try {
          if (context.token) {
            const user = await validateToken(context.token);

            if (!user.userType === 2) {
              throw new Error(
                "Você não tem permissão para deletar uma mensagem"
              );
            }

            const removedMessage = await Message.findByIdAndDelete(
              args.messageId
            );

            if (!removedMessage) {
              throw new Error("Erro ao deletar mensagem.");
            }

            context.pubsub.publish(UPDATE_CHAT, {
              updateChat: {
                message: removedMessage,
                mutationType: DELETE,
              },
            });

            return removedMessage;
          }
        } catch (err) {
          throw err;
        }
      },
    },
  },
});

export default MutationType;
