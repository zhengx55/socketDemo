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
  const [cookies] = useCookies(["userid", "userConnection", "token"]);
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const connectSocket = async (): Promise<void> => {
    try {
      const connect = await socketService.connect("wss://oin.finance");
      if (connect.connected) {
        console.log("ws connection established successfully");
        if (cookies.token && cookies.userid && socketService.socket) {
          const isValid = await gameService.logInValidate(
            socketService.socket,
            cookies.userid,
            cookies.token
          );
          if (isValid) {
            setIsLogin(true);
            socketService.socket?.emit("update_user", {
              user_id: cookies.userid,
              token: cookies.token,
            });
          } else {
            setIsLogin(false);
          }
        } else {
          setIsLogin(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const gameProgressCheck = async (): Promise<void> => {
    if (socketService.socket && cookies.token) {
      const isInGame = await gameService.gameInProgress(
        socketService.socket,
        cookies.token,
        cookies.userid
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
            component: component,
            command_type: isInGame.data.command,
          }));
          socketService.socket?.emit("enter_room", isInGame.data.room_id);
          setGameStarted(true);
        }
      }
    }
  };

  const disconnectSocket = (): void => {
    if (socketService.socket) {
      socketService.socket.close();
    }
  };

  useEffect(() => {
    if (socketService.socket) {
      socketService.socket
        .off("isLogin")
        .on("isLogin", (msg: { status: boolean }) => {
          if (!msg.status) {
            setIsLogin(false);
            isGameStarted && setGameStarted(false);
          }
        });
    }
  });

  useEffect(() => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    connectSocket();
    gameProgressCheck();
    window.addEventListener("beforeunload", () => {
      disconnectSocket();
    });
    document.body.addEventListener(
      "touchmove",
      function (e: TouchEvent) {
        // ??????????????????
        e.preventDefault();
      },
      {
        passive: false,
      }
    );
    return () => {
      window.removeEventListener("beforeunload", () => {
        disconnectSocket();
      });
      document.body.removeEventListener("touchmove", function (e: TouchEvent) {
        e.preventDefault();
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
    isLogin,
    setIsLogin,
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
