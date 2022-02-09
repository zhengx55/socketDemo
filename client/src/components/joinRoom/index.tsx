import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import gameContext from "../../gameContext";
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";

interface IJoinRoomProps {}
export const JoinRoomContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 2em;
`;

export const RoomIdInput = styled.input`
  height: 30px;
  width: 20em;
  font-size: 17px;
  outline: none;
  border: 1px solid #8e44ad;
  border-radius: 3px;
  padding: 0 10px;
`;

export const JoinButton = styled.button`
  outline: none;
  background-color: #8e44ad;
  color: #fff;
  font-size: 17px;
  border: 2px solid transparent;
  border-radius: 5px;
  padding: 4px 18px;
  transition: all 230ms ease-in-out;
  margin-top: 1em;
  cursor: pointer;
  &:hover {
    background-color: transparent;
    border: 2px solid #8e44ad;
    color: #8e44ad;
  }
`;

export function JoinRoom(props: IJoinRoomProps) {
  const [roomName, setRoomName] = useState<string>("");
  const [isJoining, setJoining] = useState<boolean>(false);
  const { setInRoom } = useContext(gameContext);

  useEffect(() => {
    return () => {
      socketService?.socket?.removeAllListeners();
    };
  }, []);

  const handleRoomChange = (e: React.ChangeEvent<any>) => {
    const value = e.target.value;
    setRoomName(value);
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const socket = socketService.socket;
    if (!roomName || roomName.trim() === "" || !socket) {
      return;
    }
    setJoining(true);
    const joined = await gameService
      .joinGameRoom(socket, roomName)
      .catch((err) => {
        console.error(err);
      });
    if (joined) setInRoom(true);
    setJoining(false);
  };
  return (
    <form onSubmit={joinRoom}>
      <JoinRoomContainer>
        <RoomIdInput
          placeholder="Room id..."
          value={roomName}
          onChange={handleRoomChange}
        />
        <JoinButton type="submit" disabled={isJoining}>
          {isJoining ? "Joining..." : "Joing"}
        </JoinButton>
      </JoinRoomContainer>
    </form>
  );
}
