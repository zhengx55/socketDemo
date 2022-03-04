import React from "react";
import styled from "styled-components";
import Portal from "../Portal";
import { motion } from "framer-motion";
import { Typography } from "../../pages/Match";

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

const ModalBody = styled.div`
  width: 50%;
  height: 70%;
  background-image: url("/img/modal_bg.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Close = styled(motion.img)`
  position: absolute;
  width: 5vw;
  aspect-ratio: 0.85;
  right: 0;
  top: -5%;
`;

function GameEnd() {
  return (
    <Portal id="game_end">
      <Backdrop>
        <ModalBody>
          <Close alt="close" src="/img/button/button_close.png" />
          <Typography weight="bold" color="#C69953">
            Score
          </Typography>
          <Typography weight="bold" color="#C69953">
            Level
          </Typography>
        </ModalBody>
      </Backdrop>
    </Portal>
  );
}

export default React.memo(GameEnd);
