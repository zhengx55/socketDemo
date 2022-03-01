import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Typography } from "../Match";
import { AnimatePresence, motion } from "framer-motion";
import { Stage } from "@inlet/react-pixi";
import Knight from "../../components/Hero";

const Container = styled.div`
  width: 100%;
  height: 100%;
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
  hidden: (i: number) => ({ opacity: 0 }),
};

function Battle() {
  const [demo, setDemo] = useState<Instruction[]>([
    { id: "button-1", button: "2", status: 0 },
    { id: "button-2", button: "2", status: 0 },
    { id: "button-3", button: "1", status: 0 },
    { id: "button-4", button: "3", status: 0 },
    { id: "button-5", button: "2", status: 0 },
    { id: "button-6", button: "2", status: 0 },
    { id: "button-7", button: "4", status: 0 },
    { id: "button-8", button: "1", status: 0 },
    { id: "button-9", button: "4", status: 0 },
  ]);

  const [battleInfo, setBattleInfo] = useState<{ rate: string; timer: string }>(
    {
      rate: "",
      timer: "",
    }
  );

  const [barLength, setBarLength] = useState<{
    timebar: number;
    buttonbar: number;
  }>({ timebar: 0, buttonbar: 0 });

  useEffect(() => {
    const bar_length =
      document.getElementsByClassName("time_bar")[0].clientWidth -
      document.getElementsByClassName("prgressive_dot")[0].clientWidth;
    const button_bar_length =
      document.getElementsByClassName("button_bar")[0].clientWidth;
    setBarLength({ timebar: bar_length, buttonbar: button_bar_length });
  }, []);

  const clickRef = useRef<{
    clickCount: number;
    clickResult: number[];
  }>({
    clickCount: 0,
    clickResult: [],
  });

  const SwiperRef = useRef<HTMLImageElement>(null);
  const FlashRef = useRef<HTMLImageElement>(null);

  const [start, setStart] = useState<boolean>(true);

  const time_bar_variant = {
    activate: { x: barLength.timebar },
    deactivate: { x: 0 },
  };

  const flash_variant = {
    activate: { opacity: 0.5 },
    deactivate: { opacity: 1 },
  };

  const onButtonClick = useCallback(
    (type: string) => {
      if (demo.length > 0 && clickRef.current.clickCount <= demo.length - 1) {
        const clickTarget = demo[clickRef.current.clickCount].button;
        switch (type) {
          case "top":
            if (Number(clickTarget) === 1) {
              setDemo(
                [...demo].map((item: Instruction, index: number) => {
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
              setDemo(
                [...demo].map((item: Instruction, index: number) => {
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
              setDemo(
                [...demo].map((item: Instruction, index: number) => {
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
              setDemo(
                [...demo].map((item: Instruction, index: number) => {
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
              setDemo(
                [...demo].map((item: Instruction, index: number) => {
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
              setDemo(
                [...demo].map((item: Instruction, index: number) => {
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
              setDemo(
                [...demo].map((item: Instruction, index: number) => {
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
              setDemo(
                [...demo].map((item: Instruction, index: number) => {
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
    [demo]
  );

  const onLaunchHandler = useCallback(() => {
    if (FlashRef.current && SwiperRef.current) {
      const flash_x = Math.floor(
        FlashRef.current.getBoundingClientRect().x +
          FlashRef.current.getBoundingClientRect().width / 2
      );
      const swiper_x = Math.floor(
        SwiperRef.current.getBoundingClientRect().x +
          SwiperRef.current.getBoundingClientRect().width / 2
      );
      clickRef.current.clickCount = 0;
      clickRef.current.clickResult = [];
      if (Math.abs(swiper_x - flash_x) <= 10) {
        setBattleInfo((prev) => ({ ...prev, rate: "Execllent" }));
      } else if (Math.abs(swiper_x - flash_x) <= 20) {
        setBattleInfo((prev) => ({ ...prev, rate: "Good" }));
      } else {
        setBattleInfo((prev) => ({ ...prev, rate: "Miss" }));
      }
    }
  }, [battleInfo]);

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
                160
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
                160
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
              animate={start ? "activate" : "deactivate"}
              variants={flash_variant}
              transition={{
                repeat: Infinity,
                ease: "easeInOut",
                duration: 0.5,
              }}
            />
            <Swiper
              animate={start ? "activate" : "deactivate"}
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
            {demo.map((item: Instruction, i: number) => {
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
              demo.length === clickRef.current.clickCount ? "" : "_disable"
            }`}
            src="/img/button/launch.png"
            onTouchStart={onLaunchHandler}
          />
        </section>
      </BattleContainer>
    </Container>
  );
}

export default React.memo(Battle);
