import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import gameContext from "../../gameContext";
import { JoinButton } from "../../App";
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";

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
  row-gap: 30px;
`;

const InfoTypo = styled.p`
  margin: 0;
  font-size: 1.5rem;
  background: -webkit-linear-gradient(#eee, #8e44ad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

function Battle() {
  const { playerInfo, setPlayerInfo, userConnection, GameInfo, setGameInfo } =
    useContext(gameContext);

  useEffect(() => {
    console.log("GameInfo:", GameInfo);
    console.log("playerInfo:", playerInfo);
    if (socketService.socket) {
      socketService.socket
        ?.off("game_update_success")
        .on("game_update_success", (msg) => {
          let user, component: any;
          if (Object.keys(msg.data.playerList).length > 0) {
            for (const player in msg.data.playerList) {
              if (msg.data.playerList[player].user_id === playerInfo.user_id) {
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
            button: msg.data.button,
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

  const onSubmitCommandHandler = async (): Promise<void> => {
    if (socketService.socket) {
      try {
        const newInfo = await gameService.gameUpdate(
          socketService.socket,
          userConnection,
          {
            room_id: GameInfo.room,
            user_id: playerInfo.user_id,
            battle_type: GameInfo.type,
            command: GameInfo.command_type,
            button: GameInfo.button,
          }
        );
        let user, component: any;
        if (Object.keys(newInfo.data.playerList).length > 0) {
          for (const player in newInfo.data.playerList) {
            if (
              newInfo.data.playerList[player].user_id === playerInfo.user_id
            ) {
              user = newInfo.data.playerList[player];
            } else {
              component = newInfo.data.playerList[player];
            }
          }
        }
        setPlayerInfo(user);
        setGameInfo((prev: any) => ({
          ...prev,
          room: newInfo.data.room_id,
          type: newInfo.data.room_type,
          component: component,
          current_user: newInfo.data.room_now_current_user,
          button: newInfo.data.button,
          command_type: newInfo.data.command,
        }));
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("socket service is not available");
    }
  };

  return (
    <Container>
      <Player>
        <InfoTypo>Your HP:{playerInfo.hp}</InfoTypo>
        <InfoTypo>
          {GameInfo.current_user === playerInfo.user_id
            ? GameInfo.command_type === "attack"
              ? "You are the attacker"
              : "You are the defender"
            : "Waiting ..."}
        </InfoTypo>
        {GameInfo.current_user === playerInfo.user_id && (
          <JoinButton onClick={onSubmitCommandHandler}>
            Launch Command
          </JoinButton>
        )}
      </Player>
      <Player>
        <InfoTypo>Enemy HP:{GameInfo.component.hp}</InfoTypo>
        <InfoTypo>
          {GameInfo.current_user !== playerInfo.user_id
            ? GameInfo.command_type === "attack"
              ? "Enemy attacking"
              : "Enemy Defending"
            : "Enemy Waiting ..."}
        </InfoTypo>
      </Player>
    </Container>
  );
}

export default Battle;
