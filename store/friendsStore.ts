import { create } from "zustand";

import type { SocialUser } from "@/mocks/users";
import { SOCIAL_MOCK_USERS } from "@/mocks/users";

const addUnique = (list: SocialUser[], user: SocialUser) => {
  if (list.some((item) => item.id === user.id)) {
    return list;
  }
  return [...list, user];
};

const removeUser = (list: SocialUser[], user: SocialUser | string) => {
  const userId = typeof user === "string" ? user : user.id;
  return list.filter((item) => item.id !== userId);
};

export type FriendsState = {
  friends: SocialUser[];
  requestsReceived: SocialUser[];
  requestsSent: SocialUser[];
  sendRequest: (user: SocialUser) => void;
  receiveRequest: (user: SocialUser) => void;
  acceptRequest: (user: SocialUser) => void;
  rejectRequest: (user: SocialUser) => void;
  cancelRequest: (user: SocialUser) => void;
  removeFriend: (user: SocialUser) => void;
  reset: () => void;
};

const initialReceived = SOCIAL_MOCK_USERS.slice(0, 2);
const initialFriends = SOCIAL_MOCK_USERS.slice(2, 4);

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: initialFriends,
  requestsReceived: initialReceived,
  requestsSent: [],

  sendRequest: (user) => {
    set((state) => {
      if (!user) return state;
      const alreadyFriend = state.friends.some((item) => item.id === user.id);
      const alreadySent = state.requestsSent.some((item) => item.id === user.id);
      if (alreadyFriend || alreadySent) {
        return state;
      }
      return {
        ...state,
        requestsReceived: removeUser(state.requestsReceived, user),
        requestsSent: addUnique(state.requestsSent, user),
      };
    });
  },

  receiveRequest: (user) => {
    set((state) => {
      if (!user) return state;
      const alreadyFriend = state.friends.some((item) => item.id === user.id);
      if (alreadyFriend) {
        return state;
      }
      return {
        ...state,
        requestsReceived: addUnique(state.requestsReceived, user),
        requestsSent: removeUser(state.requestsSent, user),
      };
    });
  },

  acceptRequest: (user) => {
    set((state) => {
      if (!user) return state;
      return {
        ...state,
        requestsReceived: removeUser(state.requestsReceived, user),
        requestsSent: removeUser(state.requestsSent, user),
        friends: addUnique(state.friends, user),
      };
    });
  },

  rejectRequest: (user) => {
    set((state) => ({
      ...state,
      requestsReceived: removeUser(state.requestsReceived, user),
    }));
  },

  cancelRequest: (user) => {
    set((state) => ({
      ...state,
      requestsSent: removeUser(state.requestsSent, user),
    }));
  },

  removeFriend: (user) => {
    set((state) => ({
      ...state,
      friends: removeUser(state.friends, user),
    }));
  },

  reset: () => {
    set({
      friends: initialFriends,
      requestsReceived: initialReceived,
      requestsSent: [],
    });
  },
}));
