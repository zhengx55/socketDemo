import { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";
import socketService from "./services/socketService";
import GameContext, { IGameContextProps } from "./context/gameContext";
import gameService from "./services/gameService";
import Battle from "./components/Battle";
import Knight from "./components/Hero";
import { Stage } from "@inlet/react-pixi";

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em;
`;

export const JoinRoomContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 2em;
`;

export const RoomIdInput = styled.input`
  height: 30px;
  width: 20em;
  font-size: 17px;
  outline: none;
  border: 1px solid #8e44ad;
  border-radius: 3px;
  padding: 0 10px;
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

export const JoinButton = styled.button`
  outline: none;
  background-color: #8e44ad;
  color: #fff;
  font-size: 17px;
  border: 2px solid transparent;
  border-radius: 5px;
  padding: 4px 18px;
  transition: all 230ms ease-in-out;
  margin-top: 1em;
  cursor: pointer;
  &:hover {
    background-color: transparent;
    border: 2px solid #8e44ad;
    color: #8e44ad;
  }
`;

const InfoTypo = styled.p`
  margin: 0;
  font-size: 1.5rem;
  background: -webkit-linear-gradient(#eee, #8e44ad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

function App() {
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [GameInfo, setGameInfo] = useState<any>({ room: "", component: {} });
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

  useEffect(() => {
    if (socketService.socket) {
      socketService.socket?.off("start_game").on("start_game", (msg) => {
        if (msg.status === "success") {
          setGameStarted(true);
        }
      });
    }
  });

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
        // socketService.socket?.on("broadcast", (res) => {
        //   console.log(res.message);
        // });
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
        socketService.socket?.once("match_info", (msg) => {
          console.log(msg.data);
          // if message contains user's data, enter the specific room id
          let user, component: any;
          if (Object.keys(msg.data.playerList).length > 0) {
            for (const player in msg.data.playerList) {
              if (msg.data.playerList[player].user_id === Number(userId)) {
                user = msg.data.playerList[player];
              } else {
                component = msg.data.playerList[player];
              }
            }
            setPlayerInfo(user);
            setGameInfo((prev: any) => ({
              ...prev,
              room: msg.data.room_id,
              type: msg.data.room_type,
              current_user: msg.data.room_now_current_user,
              component: component,
              button: msg.data.button,
              command_type: msg.data.command,
            }));
          }
          socketService.socket?.emit("enter_room", msg.data.room_id);
          socketService.socket?.on("room_joined", (res) => {
            console.log(res.message);
          });
        });
      } else {
        console.error(isMatch);
      }
    }
  };

  const onChangeHandler = (e: ChangeEvent<any>) => {
    setUserId(e.target.value);
  };

  const enterGameHandler = async () => {
    if (socketService.socket) {
      try {
        const ready = await gameService.onStartGame(
          socketService.socket,
          GameInfo.room
        );
        if (ready.status === "success") setGameStarted(true);
      } catch (error) {
        console.error(error);
        setGameStarted(false);
      }
    }
  };

  const gameContextValue: IGameContextProps = {
    playerInfo,
    setPlayerInfo,
    userConnection,
    setUserConnection,
    GameInfo,
    setGameInfo,
  };
  return (
    <GameContext.Provider value={gameContextValue}>
      {/* <AppContainer>
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
              isGameStarted ? (
                <Battle />
              ) : (
                <>
                  <LoginText>Match Info Ready</LoginText>
                  <JoinButton onClick={enterGameHandler}>Enter Game</JoinButton>
                  {playerInfo && (
                    <div
                      style={{
                        display: "flex",
                        width: "50%",
                        height: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ width: "25%" }}>
                        <InfoTypo>Your Info: </InfoTypo>
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
                      <div style={{ width: "35%" }}>
                        <InfoTypo>Component Info: </InfoTypo>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <InfoTypo>HP:</InfoTypo>
                          <InfoTypo>{GameInfo.component.hp}</InfoTypo>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <InfoTypo>Attack:</InfoTypo>
                          <InfoTypo>{GameInfo.component.attack}</InfoTypo>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <InfoTypo>Armor:</InfoTypo>
                          <InfoTypo>{GameInfo.component.armor}</InfoTypo>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )
            ) : (
              <form onSubmit={matchGame}>
                <JoinButton type="submit" disabled={isMatching}>
                  {isMatching ? "Matching..." : "Match"}
                </JoinButton>
              </form>
            )
          ) : null}
        </MainContainer>
      </AppContainer> */}
      <AppContainer>
        <Stage width={600} height={600} options={{ backgroundAlpha: 0 }}>
          <Knight />
        </Stage>
      </AppContainer>
    </GameContext.Provider>
  );
}

export default App;
