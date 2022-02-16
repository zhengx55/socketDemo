import React from "react";

export interface IGameContextProps {
  playerInfo: null | any;
  setPlayerInfo: ({}) => void;
  // isPlayerTurn: boolean;
  // setPlayerTurn: (turn: boolean) => void;
  // PlayerRole: string;
  // setPlayerRole: (role: string) => void;
  // isGameStarted: boolean;
  // setGameStarted: (started: boolean) => void;
  userConnection: string;
  setUserConnection: (id: string) => void;
}

const defaultState: IGameContextProps = {
  playerInfo: {},
  setPlayerInfo: () => {},
  // isPlayerTurn: false,
  // setPlayerTurn: () => {},
  // PlayerRole: "",
  // setPlayerRole: () => {},
  // isGameStarted: false,
  // setGameStarted: () => {},
  userConnection: "0",
  setUserConnection: () => {},
};

export default React.createContext(defaultState);
