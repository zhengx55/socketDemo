import { useEffect, useState } from "react";
import socketService from "./services/socketService";
import GameContext, { IGameContextProps } from "./context/gameContext";
import useOrientation from "./hooks/useOrientation";
import Portrait from "./pages/Prompt/portrait";
import { useCookies } from "react-cookie";
import Battle from "./pages/Battle";
import Match from "./pages/Match";
import gameService from "./services/gameService";

function App() {
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [GameInfo, setGameInfo] = useState<any>({ room: "", component: {} });
  const [isGameStarted, setGameStarted] = useState<boolean>(false);
  const [orientation] = useOrientation();
  const [cookies, setCookie] = useCookies([
    "userid",
    "userConnection",
    "token",
  ]);

  const connectSocket = async (): Promise<void> => {
    try {
      const connect = await socketService.connect("http://localhost:9000");
      if (connect.connected) {
        console.log("ws connection established successfully");
        // await loginGame();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const gameProgressCheck = async (): Promise<void> => {
    if (socketService.socket && cookies.token) {
      const isInGame = await gameService.gameInProgress(
        socketService.socket,
        cookies.token
      );
      if (isInGame.status) {
        let user, component: any;
        if (Object.keys(isInGame.data.playerList).length > 0) {
          for (const player in isInGame.data.playerList) {
            if (
              isInGame.data.playerList[player].user_id ===
              Number(cookies.userid)
            ) {
              user = isInGame.data.playerList[player];
            } else {
              component = isInGame.data.playerList[player];
            }
          }
          setPlayerInfo(user);
          setGameInfo((prev: any) => ({
            ...prev,
            room: isInGame.data.room_id,
            type: isInGame.data.room_type,
            current_user: isInGame.data.room_now_current_user,
            component: component,
            button: isInGame.data.hash,
            command_type: isInGame.data.command,
          }));
          socketService.socket?.emit("enter_room", isInGame.data.room_id);
          socketService.socket?.on("room_joined", (res) => {
            console.log(res.message);
          });
        }
        setGameStarted(true);
      } else {
        return;
      }
    }
  };

  const disconnectSocket = (): void => {
    if (socketService.socket) {
      socketService.socket.close();
    }
  };

  useEffect(() => {
    connectSocket();
    gameProgressCheck();
    window.addEventListener("beforeunload", () => {
      disconnectSocket();
    });
    return () => {
      window.removeEventListener("beforeunload", () => {
        disconnectSocket();
      });
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

  const gameContextValue: IGameContextProps = {
    playerInfo,
    setPlayerInfo,
    GameInfo,
    setGameInfo,
    setGameStarted,
    isGameStarted,
  };
  if (orientation !== "landscape") return <Portrait />;
  return (
    <GameContext.Provider value={gameContextValue}>
      {isGameStarted && <Battle />}
      {!isGameStarted && <Match />}
    </GameContext.Provider>
  );
}

export default App;
