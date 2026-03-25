"use client";

import { useReducer } from "react";

type TourState = {
  activeIndex: number;
  isComplete: boolean;
};

type TourAction =
  | { type: "go-to"; index: number; totalSteps: number }
  | { type: "next"; totalSteps: number }
  | { type: "previous"; totalSteps: number }
  | { type: "restart" };

const initialTourState: TourState = {
  activeIndex: 0,
  isComplete: false,
};

function clampIndex(index: number, totalSteps: number) {
  return Math.min(Math.max(index, 0), totalSteps - 1);
}

function tourReducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case "go-to":
      return {
        activeIndex: clampIndex(action.index, action.totalSteps),
        isComplete: false,
      };
    case "next":
      if (state.isComplete) {
        return state;
      }

      if (state.activeIndex >= action.totalSteps - 1) {
        return {
          activeIndex: action.totalSteps - 1,
          isComplete: true,
        };
      }

      return {
        ...state,
        activeIndex: state.activeIndex + 1,
      };
    case "previous":
      if (state.isComplete) {
        return {
          activeIndex: action.totalSteps - 1,
          isComplete: false,
        };
      }

      return {
        ...state,
        activeIndex: clampIndex(state.activeIndex - 1, action.totalSteps),
      };
    case "restart":
      return initialTourState;
    default:
      return state;
  }
}

export function useTourController(totalSteps: number) {
  const [state, dispatch] = useReducer(tourReducer, initialTourState);

  return {
    ...state,
    goToStep: (index: number) =>
      dispatch({ type: "go-to", index, totalSteps }),
    goNext: () => dispatch({ type: "next", totalSteps }),
    goPrevious: () => dispatch({ type: "previous", totalSteps }),
    restart: () => dispatch({ type: "restart" }),
  };
}
