import { create } from "zustand";

import type { SocialUser } from "@/mocks/users";
import { SOCIAL_MOCK_USERS } from "@/mocks/users";
import { useNotificationsStore } from "@/store/notificationsStore";

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

export type FollowRelation = {
  followerId: string;
  followingId: string;
};

export type FriendsState = {
  friends: SocialUser[];
  requestsReceived: SocialUser[];
  requestsSent: SocialUser[];
  follows: FollowRelation[];
  currentUserId: string;
  sendRequest: (user: SocialUser) => void;
  receiveRequest: (user: SocialUser) => void;
  acceptRequest: (user: SocialUser) => void;
  rejectRequest: (user: SocialUser) => void;
  cancelRequest: (user: SocialUser) => void;
  removeFriend: (user: SocialUser) => void;
  followUser: (user: SocialUser) => void;
  unfollowUser: (user: SocialUser) => void;
  isFollowing: (meId: string, otherId: string) => boolean;
  isFollowedBy: (meId: string, otherId: string) => boolean;
  isMutual: (meId: string, otherId: string) => boolean;
  reset: () => void;
};


const currentUserIdDefault = "usuario";
const initialReceived = [SOCIAL_MOCK_USERS[0], SOCIAL_MOCK_USERS[2]];
const initialFriends = [SOCIAL_MOCK_USERS[1], SOCIAL_MOCK_USERS[3]];
const initialFollows: FollowRelation[] = [
  { followerId: currentUserIdDefault, followingId: "valer" },
  { followerId: "valer", followingId: currentUserIdDefault },
  { followerId: currentUserIdDefault, followingId: "mateolab" },
  { followerId: "sarita", followingId: currentUserIdDefault },
];

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: initialFriends,
  requestsReceived: initialReceived,
  requestsSent: [],
  follows: initialFollows,
  currentUserId: currentUserIdDefault,

  sendRequest: (user) => {
    set((state) => {
      if (!user) return state;
      const alreadyFriend = state.isMutual(state.currentUserId, user.id);
      const alreadySent = state.requestsSent.some((item) => item.id === user.id);
      if (alreadyFriend || alreadySent) {
        return state;
      }

      const nextFollows = addUniqueFollow(state.follows, state.currentUserId, user.id);
      const nowMutual = nextFollows.some(
        (relation) =>
          relation.followerId === user.id && relation.followingId === state.currentUserId
      );

      return {
        ...state,
        requestsReceived: removeUser(state.requestsReceived, user),
        requestsSent: addUnique(state.requestsSent, user),
        follows: nextFollows,
        friends: nowMutual ? addUnique(state.friends, user) : state.friends,
      };
    });
  },

  receiveRequest: (user) => {
    set((state) => {
      if (!user) return state;
      const alreadyFriend = state.isMutual(state.currentUserId, user.id);
      if (alreadyFriend) {
        return state;
      }

      const nextFollows = addUniqueFollow(state.follows, user.id, state.currentUserId);

      return {
        ...state,
        requestsReceived: addUnique(state.requestsReceived, user),
        requestsSent: removeUser(state.requestsSent, user),
        follows: nextFollows,
      };
    });
  },

  acceptRequest: (user) => {
    set((state) => {
      if (!user) return state;
      const nextFollows = addUniqueFollow(state.follows, state.currentUserId, user.id);
      const nowMutual = nextFollows.some(
        (relation) =>
          relation.followerId === user.id && relation.followingId === state.currentUserId
      );

      return {
        ...state,
        requestsReceived: removeUser(state.requestsReceived, user),
        requestsSent: removeUser(state.requestsSent, user),
        friends: nowMutual ? addUnique(state.friends, user) : state.friends,
        follows: nextFollows,
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
    set((state) => {
      const nextFollows = state.follows.filter(
        (relation) =>
          !(
            (relation.followerId === state.currentUserId && relation.followingId === user.id) ||
            (relation.followerId === user.id && relation.followingId === state.currentUserId)
          )
      );
      return {
        ...state,
        friends: removeUser(state.friends, user),
        follows: nextFollows,
      };
    });
  },

  followUser: (user) => {
    let shouldNotify = false;
    let actorId = "";

    set((state) => {
      if (!user) return state;

      const alreadyFollowing = state.follows.some(
        (relation) => relation.followerId === state.currentUserId && relation.followingId === user.id
      );
      if (alreadyFollowing) {
        return state;
      }

      const nextFollows = addUniqueFollow(state.follows, state.currentUserId, user.id);
      const nowMutual =
        state.isFollowedBy(state.currentUserId, user.id) ||
        nextFollows.some(
          (relation) =>
            relation.followerId === user.id && relation.followingId === state.currentUserId
        );

      if (user.id !== state.currentUserId) {
        shouldNotify = true;
        actorId = state.currentUserId;
      }

      return {
        ...state,
        follows: nextFollows,
        friends: nowMutual ? addUnique(state.friends, user) : state.friends,
      };
    });

    if (shouldNotify && actorId) {
      useNotificationsStore.getState().addNotification({
        type: "follow",
        actorId,
      });
    }
  },

  unfollowUser: (user) => {
    set((state) => {
      const nextFollows = state.follows.filter(
        (relation) =>
          !(
            relation.followerId === state.currentUserId && relation.followingId === user.id
          )
      );
      const stillMutual = nextFollows.some(
        (relation) =>
          relation.followerId === state.currentUserId && relation.followingId === user.id
      ) &&
        nextFollows.some(
          (relation) =>
            relation.followerId === user.id && relation.followingId === state.currentUserId
        );

      return {
        ...state,
        follows: nextFollows,
        friends: stillMutual ? state.friends : removeUser(state.friends, user),
      };
    });
  },

  isFollowing: (meId, otherId) => {
    return get().follows.some((relation) => relation.followerId === meId && relation.followingId === otherId);
  },

  isFollowedBy: (meId, otherId) => {
    return get().follows.some((relation) => relation.followerId === otherId && relation.followingId === meId);
  },

  isMutual: (meId, otherId) => {
    const state = get();
    return state.isFollowing(meId, otherId) && state.isFollowedBy(meId, otherId);
  },

  reset: () => {
    set({
      friends: initialFriends,
      requestsReceived: initialReceived,
      requestsSent: [],
      follows: initialFollows,
    });
  },
}));

function addUniqueFollow(follows: FollowRelation[], followerId: string, followingId: string) {
  if (follows.some((relation) => relation.followerId === followerId && relation.followingId === followingId)) {
    return follows;
  }
  return [...follows, { followerId, followingId }];
}
