import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styled, { keyframes } from "styled-components";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Typography } from "../Match";
import { AnimatePresence, motion } from "framer-motion";
import gameContext from "../../context/gameContext";
import { Decrypt, Encrypt } from "../../utils/crypto";
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";
import { useCookies } from "react-cookie";
import FontLoading from "../../components/Loading/FontLoading";
import GameEnd from "../../components/Modal/GameEnd";
import { Stage } from "@inlet/react-pixi";
import Skill from "../../components/Skill";

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  background-image: url(/img/bg.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  flex-direction: column;
  overflow-y: hidden;
  .lazy-load-image-background {
    display: flex !important;
    align-items: center;
  }
`;

const AvatarContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 0 5vw;
  margin-top: 10px;
  justify-content: space-between;
  height: 20vh;
`;

const AvatarInfo = styled.div`
  display: flex;
  flex-shrink: 0;
  .avatar {
    width: 7vw;
    aspect-ratio: 1;
    height: auto;
    margin-right: 5px;
  }
  .battle_info {
    display: flex;
    flex-direction: column;
    min-width: 25vw;
    div {
      display: flex;
      justify-content: space-between;
      margin: 0.8vw 0;
    }
  }
  .health_bar_container {
    min-width: 25vw;
    height: 1.5vw;
    background: #453f31;
    border-radius: 6px;
  }
  .health_bar {
    height: 100%;
    background: #de712e;
    border-radius: 6px;
    transition: width 0.5s ease;
    width: 0;
  }
`;

const Direction = styled(motion.img)`
  height: 6.35vw;
  width: 6.35vw;
  touch-action: manipulation;
`;

const buttonEnlarge = keyframes`
0% { transform: scale(1) };
50% { transform: scale(1.5) };
100% { transform: scale(1) }`;

const buttonShake = keyframes` 
0% { transform: translate(1px, 1px) rotate(0deg); }
10% { transform: translate(-1px, -2px) rotate(-1deg); }
20% { transform: translate(-3px, 0px) rotate(1deg); }
30% { transform: translate(3px, 2px) rotate(0deg); }
40% { transform: translate(1px, -1px) rotate(1deg); }
50% { transform: translate(-1px, 2px) rotate(-1deg); }
60% { transform: translate(-3px, 1px) rotate(0deg); }
70% { transform: translate(3px, 1px) rotate(-1deg); }
80% { transform: translate(-1px, -1px) rotate(1deg); }
90% { transform: translate(1px, 2px) rotate(0deg); }
100% { transform: translate(1px, -2px) rotate(-1deg); }`;

const OperationContainer = styled.div`
  display: grid;
  width: 100%;
  height: 40vh;
  grid-template-columns: 27% 46% 27%;
  padding-bottom: 10px;
  .button {
    display: flex;
    align-items: center;
    flex-direction: column;
    z-index: 999;
  }
  .button_bar_container {
    display: flex;
    flex-direction: column;
    position: relative;
    align-items: flex-end;
    justify-content: center;
    .time_bar {
      width: 50%;
      height: 2.5vw;
      margin-bottom: 10px;
      border-radius: 22px;
      border: 1px solid #6a6a6a;
      position: relative;
      display: flex;
      align-items: center;
      .flash {
        height: 100%;
        width: auto;
        aspect-ratio: 5;
        position: absolute;
        right: 0;
      }
    }
    .button_bar {
      width: 100%;
      height: 5vw;
      border-radius: 22px;
      border: 1px solid #6a6a6a;
      display: flex;
      align-items: center;
      overflow: hidden;
      justify-content: center;
      img {
        width: 4vw;
        max-height: 100%;
        aspect-ratio: 1;
        margin: 0 0.2vw;
      }
      .button_active {
        animation: ${buttonEnlarge} 0.5s forwards ease;
      }
      .button_error {
        animation: ${buttonShake} 0.5s forwards ease;
      }
    }
  }
  .launch {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    .launch_button {
      aspect-ratio: 1;
      width: 8.5vw;
      touch-action: manipulation;
      transition: transform 0.2s cubic-bezier(0.075, 0.82, 0.165, 1);
      &:active {
        transform: scale(1.2);
      }
    }
    p {
      color: #fff;
      font-size: 1.5vw;
      position: absolute;
      margin: 0;
      padding: 0;
    }
  }
`;

const BattleContainer = styled.div`
  display: grid;
  width: 100%;
  height: 40vh;
  grid-template-columns: repeat(3, 1fr);
  .player {
    display: flex;
    justify-content: center;
    position: relative;
    .canvas_left {
      position: absolute;
      width: 80% !important;
      height: 80% !important;
      z-index: 1;
      bottom: -30%;
      right: 0;
    }
    .canvas_right {
      position: absolute;
      width: 80% !important;
      height: 80% !important;
      z-index: 1;
      bottom: -30%;
      left: 0;
    }
  }
  .character {
    width: 20vw;
    height: auto;
    position: absolute;
    z-index: 99;
    right: 1%;
  }

  .character_component {
    width: 20vw;
    height: auto;
    position: absolute;
    z-index: 99;
    left: 1%;
  }

  .score_panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 0;
    overflow: hidden;
    justify-content: center;
    grid-row-gap: 20px;
  }
`;

const Swiper = styled(motion.img)`
  aspect-ratio: 0.9;
  width: 1.5vw;
`;

const ScoreFont = styled(motion.h2)`
  position: absolute;
  top: -20px;
  right: 0;
  padding: 0;
  background-clip: text;
  font-size: 2vw;
  -webkit-text-stroke: 1px #f2f2f2;
  background: linear-gradient(
    180deg,
    #ffa351 0%,
    #ff6807 37%,
    #961a02 100%,
    #ff8e36 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

type Button = {
  [key: string | number]: string;
};
type Instruction = {
  id: string;
  button: string;
  status: number;
};

const button_map: Button = {
  "1": "top",
  "2": "right",
  "3": "bottom",
  "4": "left",
};

function Battle() {
  const { GameInfo, playerInfo, setGameInfo, setPlayerInfo } =
    useContext(gameContext);
  const [cookies] = useCookies(["userid", "userConnection", "token"]);
  const [buttons, setButtons] = useState<Instruction[]>([]);
  const [defaultBtn, setDefault] = useState<Instruction[]>([]);
  const [battleInfo, setBattleInfo] = useState<{
    rate: string;
    timer: number | undefined;
    over: boolean;
    result: { score: number; status: string };
  }>({
    rate: "",
    timer: undefined,
    over: false,
    result: { score: 0, status: "" },
  });
  const [texture, setTexture] = useState<{ your: string; component: string }>({
    your: "position",
    component: "position_reverse",
  });
  const [barLength, setBarLength] = useState<number>(0);
  const clickRef = useRef<{
    clickCount: number;
    clickResult: number[];
  }>({
    clickCount: 0,
    clickResult: [],
  });
  const SwiperRef = useRef<HTMLImageElement>(null);
  const FlashRef = useRef<HTMLImageElement>(null);
  const TimerRef = useRef<{
    rateTimer: number | undefined;
    textureTimer: number | undefined;
    CountdownTimer: number | undefined;
    buttonTimer: number | undefined;
  }>({
    rateTimer: undefined,
    textureTimer: undefined,
    CountdownTimer: undefined,
    buttonTimer: undefined,
  });
  const time_bar_variant = {
    activate: { x: barLength },
    deactivate: { x: 0 },
  };
  const flash_variant = {
    activate: { opacity: 0.5 },
    deactivate: { opacity: 1 },
  };

  useEffect(() => {
    return () => {
      clearTimeout(TimerRef.current.rateTimer);
      clearTimeout(TimerRef.current.textureTimer);
      clearTimeout(TimerRef.current.buttonTimer);
    };
  }, []);

  useEffect(() => {
    if (battleInfo.timer === 0) {
      autoSubmit();
      clearTimeout(TimerRef.current.CountdownTimer);
    }
  }, [battleInfo]);

  useEffect(() => {
    if (playerInfo.hp === 0) {
      setBattleInfo((prev) => ({
        ...prev,
        over: true,
        result: {
          score: GameInfo.reward.fail.integral,
          status: "lose",
        },
      }));
    } else if (GameInfo.component.hp === 0) {
      setBattleInfo((prev) => ({
        ...prev,
        over: true,
        result: {
          score: GameInfo.reward.win.integral,
          status: "win",
        },
      }));
    }
  }, [GameInfo, playerInfo]);

  useEffect(() => {
    let Instruction: any = Object.values(JSON.parse(Decrypt(playerInfo.hash)));
    setBattleInfo((prev) => ({ ...prev, timer: Instruction[1] }));
    TimerRef.current.CountdownTimer = setInterval(() => {
      setBattleInfo((prev) => ({
        ...prev,
        timer: prev.timer && prev.timer - 1,
      }));
    }, 1000);
    let buttons: Instruction[] = [];
    for (let i = 0; i < Instruction[0].length; i++) {
      buttons.push({
        id: `button-${i}`,
        button: Instruction[0][i].toString(),
        status: 0,
      });
    }
    setDefault(buttons);
    setButtons(buttons);
    const bar_length =
      document.getElementsByClassName("time_bar")[0].clientWidth -
      document.getElementsByClassName("prgressive_dot")[0].clientWidth;
    setBarLength(bar_length);
    return () => {
      clearTimeout(TimerRef.current.CountdownTimer);
    };
  }, [playerInfo.hash]);

  useEffect(() => {
    if (socketService.socket) {
      socketService.socket
        .off("game_update_success")
        .on("game_update_success", (msg) => {
          let user, component: any;
          if (msg.data) {
            if (Object.keys(msg.data.playerList).length > 0) {
              for (const player in msg.data.playerList) {
                if (
                  msg.data.playerList[player].user_id ===
                  Number(playerInfo.user_id)
                ) {
                  user = msg.data.playerList[player];
                } else {
                  component = msg.data.playerList[player];
                }
              }
            }
            setGameInfo((prev: any) => ({
              ...prev,
              room: msg.data.room_id,
              type: msg.data.room_type,
              component: component,
              reward: msg.data.room_battle_reward,
            }));
            setPlayerInfo(user);
          }
        });
    }
  });

  const autoSubmit = async (): Promise<void> => {
    let Res_buffer: any = JSON.parse(Decrypt(playerInfo.hash));
    Res_buffer.submitButton = new Array(buttons.length).fill(0);
    Res_buffer = Encrypt(JSON.stringify(Res_buffer));
    if (socketService.socket) {
      try {
        await gameService.gameUpdate(socketService.socket, cookies.token, {
          user_id: playerInfo.user_id,
          button: Res_buffer,
        });
        clickRef.current.clickCount = 0;
        clickRef.current.clickResult = [];
      } catch (error) {
        console.error(error);
      }
    }
  };

  const onButtonClick = useCallback(
    (type: string) => {
      if (
        defaultBtn.length > 0 &&
        clickRef.current.clickCount <= defaultBtn.length - 1
      ) {
        const clickTarget = buttons[clickRef.current.clickCount].button;
        switch (type) {
          case "top":
            if (Number(clickTarget) === 1) {
              setButtons(
                [...buttons].map((item: Instruction, index: number) => {
                  if (index === clickRef.current.clickCount) {
                    return {
                      ...item,
                      status: 1,
                    };
                  } else {
                    return item;
                  }
                })
              );
              clickRef.current.clickCount++;
              clickRef.current.clickResult.push(1);
            } else {
              setButtons(
                [...buttons].map((item: Instruction, index: number) => {
                  if (index === clickRef.current.clickCount) {
                    return {
                      ...item,
                      status: 2,
                    };
                  } else {
                    return item;
                  }
                })
              );
              TimerRef.current.buttonTimer = setTimeout(() => {
                setButtons(defaultBtn);
                clickRef.current.clickCount = 0;
                clickRef.current.clickResult = [];
              }, 500);
            }
            break;
          case "right":
            if (Number(clickTarget) === 2) {
              setButtons(
                [...buttons].map((item: Instruction, index: number) => {
                  if (index === clickRef.current.clickCount) {
                    return {
                      ...item,
                      status: 1,
                    };
                  } else {
                    return item;
                  }
                })
              );
              clickRef.current.clickResult.push(2);
              clickRef.current.clickCount++;
            } else {
              setButtons(
                [...buttons].map((item: Instruction, index: number) => {
                  if (index === clickRef.current.clickCount) {
                    return {
                      ...item,
                      status: 2,
                    };
                  } else {
                    return item;
                  }
                })
              );
              TimerRef.current.buttonTimer = setTimeout(() => {
                setButtons(defaultBtn);
                clickRef.current.clickCount = 0;
                clickRef.current.clickResult = [];
              }, 500);
            }
            break;
          case "bottom":
            if (Number(clickTarget) === 3) {
              setButtons(
                [...buttons].map((item: Instruction, index: number) => {
                  if (index === clickRef.current.clickCount) {
                    return {
                      ...item,
                      status: 1,
                    };
                  } else {
                    return item;
                  }
                })
              );
              clickRef.current.clickResult.push(3);
              clickRef.current.clickCount++;
            } else {
              setButtons(
                [...buttons].map((item: Instruction, index: number) => {
                  if (index === clickRef.current.clickCount) {
                    return {
                      ...item,
                      status: 2,
                    };
                  } else {
                    return item;
                  }
                })
              );
              TimerRef.current.buttonTimer = setTimeout(() => {
                setButtons(defaultBtn);
                clickRef.current.clickCount = 0;
                clickRef.current.clickResult = [];
              }, 500);
            }
            break;
          case "left":
            if (Number(clickTarget) === 4) {
              setButtons(
                [...buttons].map((item: Instruction, index: number) => {
                  if (index === clickRef.current.clickCount) {
                    return {
                      ...item,
                      status: 1,
                    };
                  } else {
                    return item;
                  }
                })
              );
              clickRef.current.clickResult.push(4);
              clickRef.current.clickCount++;
            } else {
              setButtons(
                [...buttons].map((item: Instruction, index: number) => {
                  if (index === clickRef.current.clickCount) {
                    return {
                      ...item,
                      status: 2,
                    };
                  } else {
                    return item;
                  }
                })
              );
              TimerRef.current.buttonTimer = setTimeout(() => {
                setButtons(defaultBtn);
                clickRef.current.clickCount = 0;
                clickRef.current.clickResult = [];
              }, 500);
            }
            break;
        }
      }
    },
    [buttons, GameInfo, defaultBtn]
  );

  const onLaunchHandler = useCallback(async (): Promise<void> => {
    if (clickRef.current.clickCount !== buttons.length) {
      return;
    } else {
      let Res_buffer: any = JSON.parse(Decrypt(playerInfo.hash));
      Res_buffer.submitButton = clickRef.current.clickResult;
      if (FlashRef.current && SwiperRef.current) {
        const flash_x = Math.floor(
          FlashRef.current.getBoundingClientRect().x +
            FlashRef.current.getBoundingClientRect().width / 2
        );
        const swiper_x = Math.floor(
          SwiperRef.current.getBoundingClientRect().x +
            SwiperRef.current.getBoundingClientRect().width / 2
        );

        if (Math.abs(swiper_x - flash_x) <= 10) {
          setBattleInfo((prev) => ({ ...prev, rate: "Execllent" }));
          Res_buffer.gather = 2;
        } else if (Math.abs(swiper_x - flash_x) <= 20) {
          setBattleInfo((prev) => ({ ...prev, rate: "Good" }));
          Res_buffer.gather = 1;
        } else {
          setBattleInfo((prev) => ({ ...prev, rate: "Miss" }));
          Res_buffer.gather = 0;
        }
        TimerRef.current.rateTimer = setTimeout(() => {
          setBattleInfo((prev) => ({ ...prev, rate: "" }));
        }, 1000);
        Res_buffer = Encrypt(JSON.stringify(Res_buffer));
        clickRef.current.clickCount = 0;
        clickRef.current.clickResult = [];
        if (socketService.socket) {
          console.log("submit info:", GameInfo);
          try {
            await gameService.gameUpdate(socketService.socket, cookies.token, {
              user_id: playerInfo.user_id,
              button: Res_buffer,
            });
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
  }, [GameInfo, playerInfo, buttons]);

  return (
    <Container>
      {battleInfo.over && (
        <GameEnd
          score={battleInfo.result.score}
          status={battleInfo.result.status}
        />
      )}
      <AvatarContainer>
        <AvatarInfo>
          <LazyLoadImage
            alt=""
            src="/img/avatar/Druid.png"
            effect="blur"
            className="avatar"
          />
          <div className="battle_info">
            <div>
              <Typography weight="bold" color="#C69953">
                {playerInfo.nick_name}
              </Typography>
              <Typography weight="normal" color="#C69953">
                {playerInfo.hp}
              </Typography>
            </div>
            <div className="health_bar_container">
              <span
                className="health_bar"
                style={{
                  width: `${(playerInfo.hp / playerInfo.initial_hp) * 100}%`,
                }}
              />
            </div>
          </div>
        </AvatarInfo>
        <AvatarInfo>
          <LazyLoadImage
            alt=""
            src="/img/avatar/Priest.png"
            effect="blur"
            className="avatar"
          />
          <div className="battle_info">
            <div>
              <Typography weight="bold" color="#C69953">
                {GameInfo.component.nick_name}
              </Typography>
              <Typography weight="normal" color="#C69953">
                {GameInfo.component.hp}
              </Typography>
            </div>
            <div className="health_bar_container">
              <span
                className="health_bar"
                style={{
                  width: `${
                    (GameInfo.component.hp / GameInfo.component.initial_hp) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </AvatarInfo>
      </AvatarContainer>
      <BattleContainer>
        <section className="player">
          <Stage options={{ backgroundAlpha: 0 }} className="canvas_left">
            <Skill texture="skill" position="left" />
          </Stage>
          <LazyLoadImage
            className="character"
            src="/character/Druid.png"
            alt="character"
          />
        </section>
        <section className="score_panel">
          <FontLoading loadingText="Attacking..." />
          <Typography weight="bold" color="#B09C7A" size="4vw">
            Vs
          </Typography>
          <Typography weight="normal" color="#B09C7A" size="2vw">
            Time: {battleInfo.timer}
          </Typography>
        </section>
        <section className="player">
          <Stage options={{ backgroundAlpha: 0 }} className="canvas_right">
            <Skill texture="skill" position="right" />
          </Stage>
          <LazyLoadImage
            className="character_component"
            src="/character/Priest.png"
            alt="character"
          />
        </section>
      </BattleContainer>
      <OperationContainer>
        <section className="button">
          <Direction
            alt=""
            src="/img/button/top.png"
            whileTap={{ scale: 1.1 }}
            onTouchStart={() => onButtonClick("top")}
          />
          <div
            style={{
              display: "flex",
              marginTop: "10px",
            }}
          >
            <Direction
              alt=""
              src="/img/button/left_unselected.png"
              whileTap={{ scale: 1.1 }}
              onTouchStart={() => onButtonClick("left")}
            />
            <Direction
              alt=""
              src="/img/button/bottom_btn.png"
              whileTap={{ scale: 1.1 }}
              onTouchStart={() => onButtonClick("bottom")}
              style={{ margin: "0 10px 0 10px" }}
            />
            <Direction
              alt=""
              src="/img/button/right_selected.png"
              whileTap={{ scale: 1.1 }}
              onTouchStart={() => onButtonClick("right")}
            />
          </div>
        </section>
        <section className="button_bar_container">
          <AnimatePresence>
            {battleInfo.rate !== "" && (
              <ScoreFont
                animate={{ opacity: 1, scale: 1.4, rotate: [2, -2, 0] }}
              >
                {battleInfo.rate}
              </ScoreFont>
            )}
          </AnimatePresence>
          <div className="time_bar">
            <motion.img
              className="flash"
              ref={FlashRef}
              src="/img/bar/progressive_light.png"
              alt=""
              animate={"activate"}
              variants={flash_variant}
              transition={{
                repeat: Infinity,
                ease: "easeInOut",
                duration: 0.5,
              }}
            />
            <Swiper
              animate={"activate"}
              ref={SwiperRef}
              variants={time_bar_variant}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
                duration: 1,
              }}
              alt=""
              src="/img/bar/progressive.png"
              className="prgressive_dot"
            />
          </div>
          <motion.div className="button_bar" animate="visible" initial="hidden">
            {buttons.map((item: Instruction, i: number) => {
              return (
                <LazyLoadImage
                  key={item.id}
                  className={
                    item.status === 1
                      ? "button_active"
                      : item.status === 2
                      ? "button_error"
                      : ""
                  }
                  alt=""
                  src={`/img/button/${button_map[item.button]}${
                    item.status === 0
                      ? "_unselected"
                      : item.status === 1
                      ? "_selected"
                      : ""
                  }.png`}
                />
              );
            })}
          </motion.div>
        </section>
        <section className="launch">
          <LazyLoadImage
            alt=""
            className="launch_button"
            src="/img/button/launch.png"
            onTouchStart={onLaunchHandler}
          />
        </section>
      </OperationContainer>
    </Container>
  );
}

export default Battle;
