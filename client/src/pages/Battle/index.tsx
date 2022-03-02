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
import { Stage } from "@inlet/react-pixi";
import Knight from "../../components/Hero";
import gameContext from "../../context/gameContext";
import { Decrypt, Encrypt } from "../../utils/crypto";
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";
import { useCookies } from "react-cookie";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  background-image: url(/img/bg.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  flex-direction: column;
  .lazy-load-image-background {
    display: flex !important;
    align-items: center;
  }
`;

const AvatarContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 0 5vw;
  margin-top: 3vw;
  justify-content: space-between;
  height: max-content;
  min-height: 50px;
`;

const AvatarInfo = styled.div`
  display: flex;
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
    height: 2vw;
    background: #453f31;
    border-radius: 6px;
  }
  .health_bar {
    height: 100%;
    background: #de712e;
    border-radius: 6px;
    transition: width 0.5s ease;
  }
`;

const Direction = styled(motion.img)`
  aspect-ratio: 1;
  width: 6vw;
  touch-action: manipulation;
`;

const animate = keyframes`
 0%{transform: translateY(0px)}
 20%{transform: translateY(-10px)}
 40%,100%{transform: translateY(0px)}
`;

const BattleContainer = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, 33%);
  margin-bottom: 2vw;
  @media (max-width: 800px) {
    margin-top: 3vw;
    grid-row-gap: 3vw;
  } /* grid-template-rows: 100px 200px; */
  .player {
    display: flex;
    justify-content: center;
    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  }
  .character {
    width: 20vw;
    aspect-ratio: 1;
  }
  .score_panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: 2vw;
  }
  .waiting_status {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    span {
      position: relative;
      font-size: 3vw;
      margin: 0 2px;
      color: #b09c7a;
      text-transform: uppercase;
      animation: ${animate} 1s ease infinite;
      &:nth-child(1) {
        animation-delay: 0.1s;
      }
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      &:nth-child(3) {
        animation-delay: 0.3s;
      }
      &:nth-child(4) {
        animation-delay: 0.4s;
      }
      &:nth-child(5) {
        animation-delay: 0.5s;
      }
      &:nth-child(6) {
        animation-delay: 0.6s;
      }
      &:nth-child(7) {
        animation-delay: 0.7s;
      }
      &:nth-child(8) {
        animation-delay: 0.8s;
      }
      &:nth-child(9) {
        animation-delay: 0.9s;
      }
      &:nth-child(10) {
        animation-delay: 1s;
      }
    }
  }
  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .button_bar_container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    .time_bar {
      width: 50%;
      height: 2vw;
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
      height: 4vw;
      border-radius: 22px;
      border: 1px solid #6a6a6a;
      display: flex;
      align-items: center;
      overflow: hidden;
      justify-content: center;
      img {
        width: 3.2vw;
        max-height: 100%;
        aspect-ratio: 1;
        margin: 0 0.2vw;
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
      width: 9vw;
      touch-action: manipulation;
      &:active {
        transform: scale(1.02);
      }
    }
    .launch_button_disable {
      display: none;
    }
    p {
      color: #fff;
      font-size: 2vw;
      position: absolute;
      margin: 0;
      padding: 0;
    }
  }
`;

const Swiper = styled(motion.img)`
  aspect-ratio: 0.9;
  width: 1.5vw;
`;

const ScoreFont = styled(motion.h2)`
  padding: 0;
  margin: 0;
  background-clip: text;
  font-size: 4vw;
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
  font-family: Alibaba-PuHuiTi-B, Alibaba-PuHuiTi;
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

const variants = {
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 1,
      ease: "linear",
    },
  }),
  hidden: { opacity: 0 },
};

function Battle() {
  const { GameInfo, playerInfo, setGameInfo, setPlayerInfo } =
    useContext(gameContext);
  const [cookies] = useCookies(["userid", "userConnection"]);
  const [buttons, setButtons] = useState<Instruction[]>([]);
  const [battleInfo, setBattleInfo] = useState<{
    rate: string;
    timer: string;
  }>({
    rate: "",
    timer: "",
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
  const time_bar_variant = {
    activate: { x: barLength },
    deactivate: { x: 0 },
  };
  const flash_variant = {
    activate: { opacity: 0.5 },
    deactivate: { opacity: 1 },
  };

  useEffect(() => {
    if (GameInfo.current_user === playerInfo.user_id) {
      let Instruction: any = Object.values(
        JSON.parse(Decrypt(GameInfo.button))
      );
      let buttons: Instruction[] = [];
      for (let i = 0; i < Instruction[0].length; i++) {
        buttons.push({
          id: `button-${i}`,
          button: Instruction[0][i].toString(),
          status: 0,
        });
      }
      setButtons(buttons);

      const bar_length =
        document.getElementsByClassName("time_bar")[0].clientWidth -
        document.getElementsByClassName("prgressive_dot")[0].clientWidth;

      setBarLength(bar_length);
    }
  }, [GameInfo, playerInfo]);

  useEffect(() => {
    // console.log("GameInfo:", GameInfo);
    // console.log("playerInfo:", playerInfo);
    if (socketService.socket) {
      socketService.socket
        ?.off("game_update_success")
        .on("game_update_success", (msg) => {
          let user, component: any;
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
          setPlayerInfo(user);
          setGameInfo((prev: any) => ({
            ...prev,
            room: msg.data.room_id,
            type: msg.data.room_type,
            component: component,
            current_user: msg.data.room_now_current_user,
            button: msg.data.hash,
            command_type: msg.data.command,
          }));
        });
      socketService.socket
        ?.off("game_update_error")
        .on("game_update_error", (msg) => {
          console.error(msg);
        });
    }
  });

  const onButtonClick = useCallback(
    (type: string) => {
      if (
        buttons.length > 0 &&
        clickRef.current.clickCount <= buttons.length - 1
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
            }
            clickRef.current.clickResult.push(1);
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
            }
            clickRef.current.clickResult.push(2);
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
            }
            clickRef.current.clickResult.push(3);
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
            }
            clickRef.current.clickResult.push(4);
            break;
        }
        clickRef.current.clickCount++;
      } else {
        return;
      }
    },
    [buttons]
  );

  const onLaunchHandler = useCallback(async (): Promise<void> => {
    let Res_buffer: any = JSON.parse(Decrypt(GameInfo.button));
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
      Res_buffer = Encrypt(JSON.stringify(Res_buffer));
      clickRef.current.clickCount = 0;
      clickRef.current.clickResult = [];
      if (socketService.socket) {
        console.log("submit info:", GameInfo);
        try {
          await gameService.gameUpdate(
            socketService.socket,
            cookies.userConnection,
            {
              connection_id: cookies.userConnection,
              room_id: GameInfo.room,
              user_id: playerInfo.user_id,
              battle_type: GameInfo.type,
              command: GameInfo.command_type,
              button: Res_buffer,
            }
          );
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error("socket service is not available");
      }
    }
  }, [GameInfo, playerInfo]);

  return (
    <Container>
      <AvatarContainer>
        <AvatarInfo>
          <LazyLoadImage
            alt=""
            src="/img/avatar/Knight.png"
            effect="blur"
            className="avatar"
          />
          <div className="battle_info">
            <div>
              <Typography weight="bold" color="#C69953">
                Warrior
              </Typography>
              <Typography weight="normal" color="#C69953">
                {playerInfo.hp}
              </Typography>
            </div>
            <div className="health_bar_container">
              <span className="health_bar" />
            </div>
          </div>
        </AvatarInfo>
        <AvatarInfo>
          <LazyLoadImage
            alt=""
            src="/img/avatar/Knight.png"
            effect="blur"
            className="avatar"
          />
          <div className="battle_info">
            <div>
              <Typography weight="bold" color="#C69953">
                Warrior
              </Typography>
              <Typography weight="normal" color="#C69953">
                {GameInfo.component.hp}
              </Typography>
            </div>
            <div className="health_bar_container">
              <span className="health_bar" />
            </div>
          </div>
        </AvatarInfo>
      </AvatarContainer>
      <BattleContainer>
        <section className="player">
          <Stage options={{ backgroundAlpha: 0 }}>
            <Knight texture={"position"} />
          </Stage>
        </section>
        <section className="score_panel">
          <Typography weight="bold" color="#B09C7A" size="6vw">
            Vs
          </Typography>
          <Typography weight="normal" color="#B09C7A" size="2vw">
            Time: 0
          </Typography>
          <AnimatePresence>
            {battleInfo.rate !== "" && (
              <ScoreFont
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1.2, rotate: [1, -1.4, 0] }}
              >
                {battleInfo.rate}
              </ScoreFont>
            )}
          </AnimatePresence>
        </section>
        <section className="player">
          <Stage options={{ backgroundAlpha: 0 }}>
            <Knight texture={"position_reverse"} />
          </Stage>
        </section>
        {GameInfo.current_user === playerInfo.user_id ? (
          <>
            {" "}
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
                  justifyContent: "space-between",
                  width: "50%",
                  margin: "-10px 0",
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
                  src="/img/button/right_selected.png"
                  whileTap={{ scale: 1.1 }}
                  onTouchStart={() => onButtonClick("right")}
                />
              </div>
              <Direction
                alt=""
                src="/img/button/bottom.png"
                whileTap={{ scale: 1.1 }}
                onTouchStart={() => onButtonClick("bottom")}
              />
            </section>
            <section className="button_bar_container">
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
              <motion.div
                className="button_bar"
                animate="visible"
                initial="hidden"
              >
                {buttons.map((item: Instruction, i: number) => {
                  return (
                    <motion.img
                      custom={i}
                      key={item.id}
                      variants={variants}
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
                className={`launch_button${
                  buttons.length === clickRef.current.clickCount
                    ? ""
                    : "_disable"
                }`}
                src="/img/button/launch.png"
                onTouchStart={onLaunchHandler}
              />
            </section>
          </>
        ) : (
          <>
            <section></section>
            <div className="waiting_status">
              <span>W</span>
              <span>a</span>
              <span>i</span>
              <span>t</span>
              <span>i</span>
              <span>n</span>
              <span>g</span>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
            <section></section>
          </>
        )}
      </BattleContainer>
    </Container>
  );
}

export default React.memo(Battle);
