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
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
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
  isLogin: false,
  setIsLogin: () => {},
};

export default React.createContext(defaultState);
