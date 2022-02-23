import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import gameService from "../../services/gameService";
import { Dot } from "../../components/Loading/DotLoading";
import socketService from "../../services/socketService";
import gameContext from "../../context/gameContext";
import { Button } from "../../components/Button";

type TypoProps = {
  weight?: string;
  color?: string;
  size?: string;
};

interface MatchProps {
  isLogin: boolean;
}

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

const Match = ({ isLogin }: MatchProps) => {
  const [isMatching, setIsMatching] = useState(false);
  const [isMatch, setIsMatch] = useState(true);
  const userId = "2";
  const { playerInfo, setPlayerInfo, userConnection, GameInfo, setGameInfo } =
    useContext(gameContext);

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
          <Button w="12vw" h="5vw" color="#C69953" onClick={matchGame}>
            Match
          </Button>
        )}
        {isMatch && !isMatching && (
          <Button w="12vw" h="5vw" color="#C69953" onClick={matchGame}>
            Enter
          </Button>
        )}
        {!isMatch && isMatching && (
          <Button w="12vw" h="5vw" color="#C69953" onClick={matchGame}>
            Matching
          </Button>
        )}
      </MainContainer>
    </AppContainer>
  );
};

export default Match;
