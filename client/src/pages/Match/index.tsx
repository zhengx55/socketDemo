import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import gameService from "../../services/gameService";
import { Dot } from "../../components/Loading/DotLoading";
import socketService from "../../services/socketService";
import gameContext from "../../context/gameContext";
import { Button } from "../../components/Button";
import { useCookies } from "react-cookie";
import Login from "../../components/Modal/Login";
import useAudio from "../../hooks/useAudio";

type TypoProps = {
  weight?: string;
  color?: string;
  size?: string;
  mt?: string;
};

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url("/img/Match_bg1.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
`;

const MainContainer = styled.div`
  width: 85%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url("/img/Match_bg2.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: relative;
  justify-content: center;
`;

export const MatchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10%;
  width: 100%;
  .frame {
    width: 14vw;
    height: 14vw;
    background-image: url("/img/frame.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: 100% 100%;
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
  margin: ${(props) => (props.mt ? `${props.mt} 0 0 0` : "0")};
`;

const AbsoluteFont = styled.p`
  position: absolute;
  font-size: 2vw;
  font-weight: 600;
  color: #b09c7a;
  top: -8%;
  padding: 0;
`;

const TitleContainer = styled.img`
  position: absolute;
  top: -8%;
  width: 40%;
  height: 25%;
`;

const Match = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [cookies] = useCookies(["userid", "userConnection", "token"]);
  const { setPlayerInfo, setGameInfo, setGameStarted, GameInfo } =
    useContext(gameContext);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const matchTimer = useRef<number | null>(null);
  const [time, setTime] = useState<number>(60);
  const [audio] = useAudio("/music/Forward-Assault.mp3");

  useEffect(() => {
    if (cookies.token) {
      setIsLogin(true);
    }
  }, []);

  useEffect(() => {
    if (isMatching) {
      matchTimer.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      matchTimer.current && clearTimeout(matchTimer.current);
    };
  }, [isMatching]);

  useEffect(() => {
    if (time === 0) {
      quitMatch();
      matchTimer.current && clearTimeout(matchTimer.current);
    }
  }, [time]);

  const matchGame = async () => {
    audio.play();
    setIsMatching(true);
    if (isLogin && socketService.socket) {
      const match = await gameService.matchGame(
        socketService.socket,
        cookies.token,
        cookies.userid
      );
      if (match.status === "success") {
        setIsMatching(false);
        // if message contains user's data, enter the specific room id
        let user, component: any;
        if (Object.keys(match.data.playerList).length > 0) {
          for (const player in match.data.playerList) {
            if (
              match.data.playerList[player].user_id === Number(cookies.userid)
            ) {
              user = match.data.playerList[player];
            } else {
              component = match.data.playerList[player];
            }
          }
          setPlayerInfo(user);
          setGameInfo((prev: any) => ({
            ...prev,
            room: match.data.room_id,
            type: match.data.room_type,
            component: component,
            reward: match.data.room_battle_reward,
          }));
        }
        socketService.socket?.emit("enter_room", match.data.room_id);
        socketService.socket?.on("room_joined", (res) => {
          console.log(res.message);
        });
        try {
          const ready = await gameService.onStartGame(
            socketService.socket,
            match.data.room_id
          );
          if (ready.status === "success") setGameStarted(true);
        } catch (error) {
          console.error(error);
          setGameStarted(false);
        }
      }
    }
  };

  const quitMatch = async (): Promise<void> => {
    try {
      if (socketService.socket) {
        const quit = await gameService.quitMatch(
          socketService.socket,
          cookies.userid,
          cookies.token
        );
        if (quit) {
          setIsMatching(false);
          setTime(60);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppContainer>
      <MainContainer>
        {!isLogin && <Login setIsLogin={setIsLogin} />}
        <TitleContainer alt="" src="/img/Ribbon.png" />
        <AbsoluteFont>Competition {cookies.userid}</AbsoluteFont>
        {isMatching ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography weight="bold" color="#C69953">
              Matching
            </Typography>
            <Dot>
              <li className="dot" />
              <li className="dot" />
              <li className="dot" />
              <li className="dot" />
              <li className="dot" />
            </Dot>
          </div>
        ) : (
          <>
            <Typography weight="bold" color="#C69953">
              Click start to match
            </Typography>
          </>
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
        {!isMatching ? (
          <Button w="12vw" h="5vw" color="#C69953" onTouchStart={matchGame}>
            Match
          </Button>
        ) : (
          <Button w="12vw" h="5vw" color="#C69953" onTouchStart={quitMatch}>
            Cancel: {time}
          </Button>
        )}
      </MainContainer>
    </AppContainer>
  );
};

export default Match;
