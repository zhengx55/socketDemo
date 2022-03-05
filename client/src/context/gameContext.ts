import React from "react";

export interface IGameContextProps {
  playerInfo: null | any;
  setPlayerInfo: ({}) => void;
  GameInfo: {
    current_user: string;
    room: string;
    type: string;
    command_type: string;
    component: any;
    button: string;
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
    current_user: "",
    room: "",
    type: "",
    component: {},
    command_type: "",
    button: "",
    reward: { fail: {}, win: {} },
  },
  setGameInfo: () => {},
  setGameStarted: () => {},
  isGameStarted: false,
};

export default React.createContext(defaultState);
