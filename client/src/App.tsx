import { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";
import socketService from "./services/socketService";
import {
  JoinButton,
  JoinRoomContainer,
  RoomIdInput,
} from "./components/joinRoom";
import GameContext, { IGameContextProps } from "./gameContext";
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
`;

const InfoTypo = styled.p`
  margin: 0;
  font-size: 1.5rem;
  background: -webkit-linear-gradient(#eee, #8e44ad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isMatch, setIsMatch] = useState(false);
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
        setIsLogin(true);
        socketService.socket?.on("broadcast", (res) => {
          console.log(res.message);
        });
      } else {
        setIsLogin(false);
      }
    });
  };

  const matchGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatching(true);
    if (isLogin && socketService.socket) {
      const match = await gameService.matchGame(
        socketService.socket,
        userConnection,
        userId
      );
      if (!match.room) {
        setIsMatching(false);
        setIsMatch(true);
        socketService.socket?.on("match_info", (msg) => {
          console.log(msg.data);
          if (msg.data.playerList[userId])
            setPlayerInfo(msg.data.playerList[userId]);
        });
      } else {
        console.error(isMatch);
      }
    }
  };

  const onChangeHandler = (e: ChangeEvent<any>) => {
    setUserId(e.target.value);
  };

  const gameContextValue: IGameContextProps = {
    isInRoom,
    setInRoom,
    playerInfo,
    setPlayerInfo,
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
        <WelcomeText>WS PlayGround</WelcomeText>
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
          {isLogin ? (
            isMatch ? (
              <>
                <LoginText>Match Info Ready</LoginText>
                {playerInfo && (
                  <div style={{ width: "15%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <InfoTypo>HP:</InfoTypo>
                      <InfoTypo>{playerInfo.hp}</InfoTypo>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <InfoTypo>Attack:</InfoTypo>
                      <InfoTypo>{playerInfo.attack}</InfoTypo>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <InfoTypo>Armor:</InfoTypo>
                      <InfoTypo>{playerInfo.armor}</InfoTypo>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={matchGame}>
                <JoinButton type="submit" disabled={isMatching}>
                  {isMatching ? "Matching..." : "Match"}
                </JoinButton>
              </form>
            )
          ) : null}
        </MainContainer>
      </AppContainer>
    </GameContext.Provider>
  );
}

export default App;
