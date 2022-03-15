import React from "react";

export interface IGameContextProps {
  playerInfo: null | any;
  setPlayerInfo: ({}) => void;
  GameInfo: {
    room: string;
    type: string;
    component: any;
    reward: { fail: any; win: any };
  };
  setGameInfo: (info: any) => void;
  setGameStarted: (value: boolean) => void;
  isGameStarted: boolean;
}

const defaultState: IGameContextProps = {
  playerInfo: {},
  setPlayerInfo: () => {},
  GameInfo: {
    room: "",
    type: "",
    component: {},
    reward: { fail: {}, win: {} },
  },
  setGameInfo: () => {},
  setGameStarted: () => {},
  isGameStarted: false,
};

export default React.createContext(defaultState);
