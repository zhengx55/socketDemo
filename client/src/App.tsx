import { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";
import socketService from "./services/socketService";
import GameContext, { IGameContextProps } from "./context/gameContext";
import gameService from "./services/gameService";
import useOrientation from "./hooks/useOrientation";
import Match from "./pages/Match";

type TypoProps = {
  weight?: string;
  color?: string;
  size?: string;
};

export const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url("/img/Match_bg1.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
`;

export const MatchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10%;
  width: 100%;
  .frame {
    width: 20%;
    background-image: url("/img/frame.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    aspect-ratio: 0.9;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const Typography = styled.p<TypoProps>`
  font-size: ${(props) => (props.size ? props.size : "2vw")};
  font-weight: ${(props) => props.weight};
  color: ${(props) => props.color};
  line-height: 20px;
  padding: 0;
  margin: 0;
`;

const attackSheet = "knight/attack.json";
const positioSheet = "knight/position.json";
const deadSheet = "knight/dead.json";

function App() {
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [GameInfo, setGameInfo] = useState<any>({ room: "", component: {} });
  const [isGameStarted, setGameStarted] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [userConnection, setUserConnection] = useState<string>("0");
  const [userId, setUserId] = useState<string>("0");
  const orientation = useOrientation();

  const connectSocket = async (): Promise<void> => {
    await socketService
      .connect("ws://localhost:9000")
      .then(() => {
        console.log("Ws service connected successfully");
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  const disconnectSocket = (): void => {
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

  const loginGame = async (e: React.FormEvent): Promise<void> => {
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
      } else {
        setIsLogin(false);
      }
    });
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
  if (orientation !== "landscape") return null;
  return (
    <GameContext.Provider value={gameContextValue}>
      {!isGameStarted && <Match isLogin={isLogin} />}
      {/* <AppContainer>
        <Stage width={800} height={800} options={{ backgroundAlpha: 0 }}>
          <Knight texture={key} />
        </Stage>
        <button
          onClick={() => {
            setKey(key === "attack" ? "position" : "attack");
          }}
        >
          Change Texture
        </button>
      </AppContainer> */}
    </GameContext.Provider>
  );
}

export default App;
