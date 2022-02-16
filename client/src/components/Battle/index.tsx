import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import gameContext from "../../gameContext";
import { JoinButton } from "../../App";
import socketService from "../../services/socketService";

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const Player = styled.div`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const InfoTypo = styled.p`
  margin: 0;
  font-size: 1.5rem;
  background: -webkit-linear-gradient(#eee, #8e44ad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

function Battle() {
  const [role, setRole] = useState<string>("");
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false);

  useEffect(() => {
    if (socketService.socket)
      socketService.socket?.off("start_game").on("start_game", (msg) => {
        setRole(msg.role);
        console.log(msg);
      });
  });

  return (
    <Container>
      <Player>
        <InfoTypo>{role}</InfoTypo>
        {!isPlayerTurn && (
          <>
            <InfoTypo>Your Command:</InfoTypo>
            <JoinButton>Launch</JoinButton>
          </>
        )}
      </Player>
      <Player>
        <InfoTypo>{role}</InfoTypo>
        {!isPlayerTurn && <InfoTypo>... Component's turn</InfoTypo>}
      </Player>
    </Container>
  );
}

export default Battle;
