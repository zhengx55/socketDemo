import { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";
import socketService from "./services/socketService";
import {
  JoinButton,
  JoinRoom,
  JoinRoomContainer,
  RoomIdInput,
} from "./components/joinRoom";
import GameContext, { IGameContextProps } from "./gameContext";
import { Game } from "./components/Game";
import gameService from "./services/gameService";

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em;
`;

const WelcomeText = styled.h1`
  margin: 0;
  font-size: 4rem;
  background: -webkit-linear-gradient(#eee, #8e44ad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const LoginText = styled.p`
  margin: 0;
  font-size: 2rem;
  background: -webkit-linear-gradient(#eee, #8e44ad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const MainContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 12rem;
  justify-content: center;
`;

function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"x" | "o">("x");
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [isLogin, setIsLogin] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [userConnection, setUserConnection] = useState("0");
  const [userId, setUserId] = useState("0");

  const connectSocket = async () => {
    await socketService
      .connect("http://localhost:9000")
      .then(() => {
        console.log("Ws service connected successfully");
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  const disconnectSocket = () => {
    if (socketService.socket) socketService.socket.close();
  };

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  const loginGame = async (e: React.FormEvent) => {
    e.preventDefault();
    let random = "";
    for (let i = 0; i < 4; i++) {
      random += Math.floor(Math.random() * 9 + 1);
    }
    setUserConnection(random);
    socketService.socket?.emit("request_login", {
      connection_id: random,
      user_id: userId,
    });
    socketService.socket?.on("login_status", (res) => {
      if (res.status === "success") {
        setIsLogin(`Logged in successfully Id ${res.id}`);
      } else if (res.status.includes("already")) {
        setIsLogin(`You are already logged in ${res.id}`);
      } else {
        setIsLogin("Loggin fail");
      }
    });
  };

  const matchGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatching(true);
    // const socket = socketService.socket;
    if (isLogin && socketService.socket) {
      const match = await gameService.matchGame(
        socketService.socket,
        userConnection,
        userId
      );
      if (match) {
        setIsMatching(false);
      }
    }
  };

  const onChangeHandler = (e: ChangeEvent<any>) => {
    setUserId(e.target.value);
  };

  const gameContextValue: IGameContextProps = {
    isInRoom,
    setInRoom,
    playerSymbol,
    setPlayerSymbol,
    isPlayerTurn,
    setPlayerTurn,
    isGameStarted,
    setGameStarted,
    userConnection,
    setUserConnection,
  };
  return (
    <GameContext.Provider value={gameContextValue}>
      <AppContainer>
        <WelcomeText>Tic-Tac-Toe</WelcomeText>
        <MainContainer>
          <LoginText>{isLogin}</LoginText>
          {!isLogin && (
            <form onSubmit={loginGame}>
              <JoinRoomContainer>
                <RoomIdInput
                  placeholder="User id ..."
                  value={userId}
                  onChange={onChangeHandler}
                />
                <JoinButton type="submit" disabled={isMatching}>
                  Login
                </JoinButton>
              </JoinRoomContainer>
            </form>
          )}
          {isLogin.includes("successfully") && (
            <form onSubmit={matchGame}>
              <JoinRoomContainer>
                <RoomIdInput
                  placeholder="User id ..."
                  value={userId}
                  onChange={onChangeHandler}
                />
                <JoinButton type="submit" disabled={isMatching}>
                  {isMatching ? "Matching..." : "Match"}
                </JoinButton>
              </JoinRoomContainer>
            </form>
          )}
          {/* {!isInRoom && <JoinRoom />} */}
          {isInRoom && <Game />}
        </MainContainer>
      </AppContainer>
    </GameContext.Provider>
  );
}

export default App;
