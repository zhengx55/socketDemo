import { useEffect, useState } from "react";
import socketService from "./services/socketService";
import GameContext, { IGameContextProps } from "./context/gameContext";
import useOrientation from "./hooks/useOrientation";
import Portrait from "./pages/Prompt/portrait";
import { useCookies } from "react-cookie";
import Battle from "./pages/Battle/Battle";
import Match from "./pages/Match";

function App() {
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [GameInfo, setGameInfo] = useState<any>({ room: "", component: {} });
  const [isGameStarted, setGameStarted] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [userConnection, setUserConnection] = useState<string>("0");
  const [orientation] = useOrientation();
  const [cookies, setCookie] = useCookies(["userid"]);

  const connectSocket = async (): Promise<void> => {
    try {
      const connect = await socketService.connect("ws://localhost:9000");
      if (connect.connected) {
        console.log("ws connection established successfully");
        await loginGame();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const disconnectSocket = (): void => {
    if (socketService.socket) {
      socketService.socket.close();
    }
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

  const loginGame = async (): Promise<void> => {
    let random = "";
    for (let i = 0; i < 4; i++) {
      random += Math.floor(Math.random() * 9 + 1);
    }
    let userId = "";
    if (!cookies.userid) {
      for (let i = 0; i < 1; i++) {
        userId += Math.floor(Math.random() * 9 + 1);
      }
      setCookie("userid", userId, { path: "/" });
    } else {
      userId = cookies.userid;
    }
    setUserConnection(random);
    socketService.socket?.emit("request_login", {
      connection_id: random,
      user_id: userId,
    });
    socketService.socket?.on("login_status", (res) => {
      if (res.status === "success" || res.status.includes("already")) {
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
    });
  };

  const gameContextValue: IGameContextProps = {
    playerInfo,
    setPlayerInfo,
    userConnection,
    setUserConnection,
    GameInfo,
    setGameInfo,
    setGameStarted,
    isGameStarted,
  };
  if (orientation !== "landscape") return <Portrait />;
  return (
    <GameContext.Provider value={gameContextValue}>
      {isGameStarted && <Battle />}
      {!isGameStarted && <Match isLogin={isLogin} />}
    </GameContext.Provider>
  );
}

export default App;
