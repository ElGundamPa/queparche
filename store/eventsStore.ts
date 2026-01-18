import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EventAttendee {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  joinedAt: string;
}

interface EventAttendees {
  [eventId: string]: EventAttendee[];
}

interface EventsState {
  eventAttendees: EventAttendees;
  joinedEvents: { [eventId: string]: boolean };

  // Actions
  joinEvent: (eventId: string, user: EventAttendee) => void;
  leaveEvent: (eventId: string, userId: string) => void;
  getEventAttendees: (eventId: string) => EventAttendee[];
  hasUserJoined: (eventId: string, userId: string) => boolean;
  getAttendeesCount: (eventId: string) => number;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      eventAttendees: {},
      joinedEvents: {},

      joinEvent: (eventId: string, user: EventAttendee) => {
        set((state) => {
          const currentAttendees = state.eventAttendees[eventId] || [];

          // Check if user already joined
          const alreadyJoined = currentAttendees.some(a => a.id === user.id);
          if (alreadyJoined) return state;

          return {
            eventAttendees: {
              ...state.eventAttendees,
              [eventId]: [user, ...currentAttendees],
            },
            joinedEvents: {
              ...state.joinedEvents,
              [eventId]: true,
            },
          };
        });
      },

      leaveEvent: (eventId: string, userId: string) => {
        set((state) => {
          const currentAttendees = state.eventAttendees[eventId] || [];
          const updatedAttendees = currentAttendees.filter(a => a.id !== userId);

          const newJoinedEvents = { ...state.joinedEvents };
          delete newJoinedEvents[eventId];

          return {
            eventAttendees: {
              ...state.eventAttendees,
              [eventId]: updatedAttendees,
            },
            joinedEvents: newJoinedEvents,
          };
        });
      },

      getEventAttendees: (eventId: string) => {
        return get().eventAttendees[eventId] || [];
      },

      hasUserJoined: (eventId: string, userId: string) => {
        const attendees = get().eventAttendees[eventId] || [];
        return attendees.some(a => a.id === userId);
      },

      getAttendeesCount: (eventId: string) => {
        return (get().eventAttendees[eventId] || []).length;
      },
    }),
    {
      name: 'events-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
