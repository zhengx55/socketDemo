import React, { useContext } from "react";
import styled from "styled-components";
import Portal from "../Portal";
import { motion } from "framer-motion";
import { Typography } from "../../pages/Match";
import { Button } from "../Button/index";
import gameContext from "../../context/gameContext";

type FlexProps = {
  px?: string;
  mt?: string;
};

interface GameEndModalProp {
  score: number;
  status: string;
}

const Backdrop = styled.div`
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalBody = styled(motion.div)`
  width: 50%;
  height: 30vw;
  background-image: url("/img/modal_bg.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; ;
`;

const Close = styled(motion.img)`
  position: absolute;
  width: 5vw;
  aspect-ratio: 0.85;
  right: 0;
  top: -5%;
`;

const ModalTitle = styled.div`
  position: absolute;
  background-image: url("/img/modal_title.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
`;

const FlexContent = styled.div<FlexProps>`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: ${(props) => (props.px ? `0 ${props.px}` : "0")};
  margin-top: ${(props) => (props.mt ? `${props.mt}` : "0")};
`;

function GameEnd({ score }: GameEndModalProp) {
  const { setGameStarted } = useContext(gameContext);
  return (
    <Portal id="game_end">
      <Backdrop>
        <ModalBody
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, duration: 2 }}
        >
          <Close
            alt="close"
            src="/img/button/button_close.png"
            whileTap={{ scale: 1.2 }}
            onTouchEnd={() => setGameStarted(false)}
          />
          <FlexContent px="23%">
            <Typography weight="normal" color="#C69953">
              Score
            </Typography>
            <Typography weight="normal" color="#C69953">
              Level
            </Typography>
          </FlexContent>
          <FlexContent px="25%" mt="3vw">
            <Typography weight="bold" color="#C69953" size="2.5vw">
              {score}
            </Typography>
            <Typography weight="bold" color="#C69953" size="2.5vw">
              {score > 0 ? "A" : "B"}
            </Typography>
          </FlexContent>
          <FlexContent px="15%" mt="3.5vw">
            <Button
              color="#C69953"
              w="15vw"
              h="50px"
              whileTap={{ scale: 1.2 }}
              onTouchEnd={() => setGameStarted(false)}
            >
              Continue
            </Button>
            <Button
              color="#fff"
              w="15vw"
              h="50px"
              whileTap={{ scale: 1.2 }}
              bg="url(/img/button_blue.png)"
            >
              Share
            </Button>
          </FlexContent>
        </ModalBody>
      </Backdrop>
    </Portal>
  );
}

export default React.memo(GameEnd);
