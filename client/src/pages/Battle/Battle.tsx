import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Typography } from "../Match";
import { motion } from "framer-motion";

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-image: url(/img/bg.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 101% 100%;
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
  .health_bar {
    min-width: 25vw;
    height: 12px;
    background: #453f31;
    border-radius: 6px;
  }
`;

const Direction = styled(motion.img)`
  aspect-ratio: 1;
  width: 6vw;
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
    }
    .button_bar {
      width: 100%;
      height: 3vw;
      border-radius: 22px;
      border: 1px solid #6a6a6a;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 2.6vw;
        max-height: 100%;
        aspect-ratio: 1;
        margin: 0 0.6vw;
      }
    }
  }
  .launch {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    img {
      aspect-ratio: 1;
      width: 9vw;
      &:active {
        transform: scale(1.02);
      }
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

const ScoreFont = styled.h2`
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

function Battle() {
  const [demo, setDemo] = useState<Instruction[]>([
    { id: "button-1", button: "4", status: 0 },
    { id: "button-2", button: "2", status: 0 },
    { id: "button-3", button: "1", status: 0 },
    { id: "button-4", button: "3", status: 0 },
    { id: "button-5", button: "2", status: 0 },
    { id: "button-6", button: "2", status: 0 },
    { id: "button-7", button: "4", status: 0 },
    { id: "button-8", button: "1", status: 0 },
  ]);

  const [battleInfo, setBattleInfo] = useState<{ score: number; rate: string }>(
    {
      score: 0,
      rate: "2",
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

  const variants = {
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.3,
      },
    }),
    hidden: { opacity: 0, x: 200 },
  };

  const clickRef = useRef<{
    clickCount: number;
    clickResult: number[];
  }>({
    clickCount: 0,
    clickResult: [],
  });

  const [start, setStart] = useState<boolean>(true);
  const time_bar_variant = {
    activate: { x: barLength.timebar },
    deactivate: { x: 0 },
  };
  const onButtonClick = useCallback(
    (type: string) => {
      if (demo.length > 0 && clickRef.current.clickCount <= demo.length - 1) {
        const clickTarget = demo[clickRef.current.clickCount].button;
        switch (type) {
          case "top":
            if (Number(clickTarget) === 1) {
              setBattleInfo((prev) => ({ ...prev, score: prev.score + 1 }));
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
              setBattleInfo((prev) => ({ ...prev, score: prev.score + 1 }));
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
              setBattleInfo((prev) => ({ ...prev, score: prev.score + 1 }));
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
              setBattleInfo((prev) => ({ ...prev, score: prev.score + 1 }));
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
            <span className="health_bar" />
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
            <span className="health_bar" />
          </div>
        </AvatarInfo>
      </AvatarContainer>
      <BattleContainer>
        <section className="player">
          <LazyLoadImage
            alt=""
            className="character"
            src="/img/character/Knight.png"
            effect="blur"
          />
        </section>
        <section className="score_panel">
          <Typography weight="bold" color="#B09C7A" size="6vw">
            Vs
          </Typography>
          <Typography weight="normal" color="#B09C7A" size="2vw">
            Score: {battleInfo.score}
          </Typography>
          <ScoreFont>{battleInfo.rate}</ScoreFont>
        </section>
        <section className="player">
          <LazyLoadImage
            alt=""
            className="character"
            src="/img/character/Knight.png"
            effect="blur"
          />
        </section>
        <section className="button">
          <Direction
            alt=""
            src="/img/button/top.png"
            whileTap={{ scale: 1.1 }}
            onClick={() => onButtonClick("top")}
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
              onClick={() => onButtonClick("left")}
            />
            <Direction
              alt=""
              src="/img/button/right_selected.png"
              whileTap={{ scale: 1.1 }}
              onClick={() => onButtonClick("right")}
            />
          </div>
          <Direction
            alt=""
            src="/img/button/bottom.png"
            whileTap={{ scale: 1.1 }}
            onClick={() => onButtonClick("bottom")}
          />
        </section>
        <section className="button_bar_container">
          <div className="time_bar">
            <Swiper
              animate={start ? "activate" : "deactivate"}
              variants={time_bar_variant}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeOut",
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
            src="/img/button/launch.png"
            effect="blur"
            onClick={() => {
              console.log(clickRef.current.clickResult);
            }}
          />
        </section>
      </BattleContainer>
    </Container>
  );
}

export default React.memo(Battle);
