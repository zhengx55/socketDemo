import { useEffect, useState } from "react";
import styled from "styled-components";
import socketService from "./services/socketService";
import { JoinRoom } from "./components/joinRoom";
import GameContext, { IGameContextProps } from "./gameContext";
import { Game } from "./components/Game";
import axios from "axios";

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

const MainContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"x" | "o">("x");
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);

  const connectSocket = async () => {
    await socketService
      .connect("http://localhost:9000")
      .then(() => {
        console.log("Ws service connected successfully");
      })
      .catch((error) => {
        console.log("Error:", error);
      });
    let random = "";
    for (let i = 0; i < 4; i++) {
      random += Math.floor(Math.random() * 9 + 1);
    }
    socketService.socket?.emit("request_login", { connection_id: random });
    socketService.socket?.on("login_status", (status) => {
      console.log(status);
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

  const onClickHandler = async () => {
    let random = "";
    for (let i = 0; i < 4; i++) {
      random += Math.floor(Math.random() * 9 + 1);
    }
    const res = await axios.post("https://dao.oin.finance/index/game/login", {
      data: { coon_id: random },
    });
    if (res.status === 200) console.log(res);
    // if (socketService.socket) {
    //   // socketService.socket?.emit("game_init", {
    //   //   message: "req for attack command",
    //   // });
    //   // socketService.socket?.once("message_saved", (data) => {
    //   //   console.log("You are the attacker:", data);
    //   // });
    //   socketService.socket.emit("game_init", { roomId: "200" });
    // }
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
  };
  return (
    <GameContext.Provider value={gameContextValue}>
      <AppContainer>
        <WelcomeText>Tic-Tac-Toe</WelcomeText>
        <MainContainer>
          {!isInRoom && <JoinRoom />}
          {isInRoom && <Game />}
        </MainContainer>
      </AppContainer>
    </GameContext.Provider>
  );
}

export default App;
