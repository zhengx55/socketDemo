import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import gameService from "../../services/gameService";
import { Dot } from "../../components/Loading/DotLoading";
import socketService from "../../services/socketService";
import gameContext from "../../context/gameContext";
import { Button } from "../../components/Button";
import { useCookies } from "react-cookie";

type TypoProps = {
  weight?: string;
  color?: string;
  size?: string;
  mt?: string;
};

interface MatchProps {
  isLogin: boolean;
}

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

const MainContainer = styled.div`
  width: 85%;
  height: 80%;
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
  margin: ${(props) => (props.mt ? `${props.mt} 0 0 0` : "0")};
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

const Match = ({ isLogin }: MatchProps) => {
  const [isMatching, setIsMatching] = useState(false);
  const [isMatch, setIsMatch] = useState(false);
  const [cookies] = useCookies(["userid", "userConnection"]);
  const { setPlayerInfo, setGameInfo, setGameStarted, GameInfo } =
    useContext(gameContext);

  const matchGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatching(true);
    if (isLogin && socketService.socket) {
      const match = await gameService.matchGame(
        socketService.socket,
        cookies.userConnection,
        cookies.userid
      );
      if (match.status === "success") {
        setIsMatching(false);
        setIsMatch(true);

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
            current_user: match.data.room_now_current_user,
            component: component,
            button: match.data.hash,
            command_type: match.data.command,
          }));
        }
        socketService.socket?.emit("enter_room", match.data.room_id);
        socketService.socket?.on("room_joined", (res) => {
          console.log(res.message);
        });
      }
    }
  };

  const enterGameHandler = async () => {
    if (socketService.socket) {
      try {
        console.log(GameInfo);
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

  return (
    <AppContainer>
      <MainContainer>
        <TitleContainer>Competition</TitleContainer>
        {!isMatch && isMatching ? (
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
        ) : !isMatching && isMatch ? (
          <>
            <Typography weight="bold" color="#C69953">
              Game Ready!
            </Typography>
          </>
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
        {!isMatch && !isMatching && (
          <Button w="12vw" h="5vw" color="#C69953" onTouchStart={matchGame}>
            Match
          </Button>
        )}
        {isMatch && !isMatching && (
          <Button
            w="12vw"
            h="5vw"
            color="#C69953"
            onTouchStart={enterGameHandler}
          >
            Enter
          </Button>
        )}
        {!isMatch && isMatching && (
          <Button w="12vw" h="5vw" color="#C69953" disabled>
            Matching
          </Button>
        )}
      </MainContainer>
    </AppContainer>
  );
};

export default Match;
