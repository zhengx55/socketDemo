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
  };
  setGameInfo: (info: any) => void;
  userConnection: string;
  setUserConnection: (id: string) => void;
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
  },
  setGameInfo: () => {},
  userConnection: "0",
  setUserConnection: () => {},
};

export default React.createContext(defaultState);
