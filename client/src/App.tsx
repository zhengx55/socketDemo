import { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";
import socketService from "./services/socketService";
import GameContext, { IGameContextProps } from "./context/gameContext";
import gameService from "./services/gameService";
import Battle from "./components/Battle";
import useOrientation from "./hooks/useOrientation";
import { Dot } from "./components/Loading/DotLoading";

type TypoProps = {
  weight?: string;
  color?: string;
  size?: string;
};

const AppContainer = styled.div`
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

const MainContainer = styled.div`
  width: 85%;
  height: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url("/img/Match_bg2.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: relative;
  padding-top: 1%;
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

const TitleContainer = styled.div`
  position: absolute;
  top: -8%;
  width: 40%;
  height: 25%;
  padding-top: 2.5%;
  background-image: url("/img/Ribbon.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  justify-content: center;
  font-size: 2vw;
  font-weight: 600;
  color: #b09c7a;
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

const attackSheet = "knight/attack.json";
const positioSheet = "knight/position.json";
const deadSheet = "knight/dead.json";

function App() {
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [GameInfo, setGameInfo] = useState<any>({ room: "", component: {} });
  const [isGameStarted, setGameStarted] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isMatch, setIsMatch] = useState(false);
  const [userConnection, setUserConnection] = useState("0");
  const [userId, setUserId] = useState("0");
  const orientation = useOrientation();

  const connectSocket = async () => {
    await socketService
      .connect("ws://localhost:9000")
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
    // connectSocket();
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
  if (orientation !== "landscape") return null;
  return (
    <GameContext.Provider value={gameContextValue}>
      <AppContainer>
        <MainContainer>
          <TitleContainer>Competition</TitleContainer>
          {!isMatching ? (
            <>
              <Dot>
                <li className="dot"></li>
                <li className="dot"></li>
                <li className="dot"></li>
                <li className="dot"></li>
                <li className="dot"></li>
              </Dot>
              <Typography weight="bold" color="#C69953">
                Matching opponents
              </Typography>
            </>
          ) : (
            <Typography weight="bold" color="#C69953">
              Ready!
            </Typography>
          )}
          <MatchContainer>
            <div className="frame" />
            <Typography color="#B09C7A" weight="bold" size="6vw">
              Vs
            </Typography>
            <div className="frame">
              <Typography color="#C69953" weight="bold" size="8vw">
                ?
              </Typography>
            </div>
          </MatchContainer>
        </MainContainer>
      </AppContainer>
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
