import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import styled from "styled-components";
import gameContext from "../../context/gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import Portal from "../Portal";
import { Backdrop } from "./GameEnd";
import "./index.scss";

const ModalBody = styled.div`
  width: 50%;
  height: 25vw;
  position: relative;
  display: flex;
  background: transparent;
  flex-direction: column;
  align-items: center;
`;

function Login() {
  const [loginInfo, setLoginInfo] = useState<{
    userId: string;
    address: string;
  }>({ userId: "", address: "" });

  const { setIsLogin, setPlayerInfo, setGameInfo, setGameStarted } =
    useContext(gameContext);

  const [cookies, setCookie] = useCookies([
    "userid",
    "userConnection",
    "token",
  ]);

  const onSubmitHandler = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    let random = "";
    if (!cookies.userConnection) {
      for (let i = 0; i < 4; i++) {
        random += Math.floor(Math.random() * 9 + 1);
      }
      setCookie("userConnection", random, {
        path: "/",
        secure: false,
        sameSite: "none",
      });
    } else {
      random = cookies.userConnection;
    }
    try {
      if (socketService.socket) {
        const res: { token: string; userId: any } =
          await gameService.loginInGame(
            socketService.socket,
            random,
            loginInfo.userId,
            loginInfo.address
          );
        if (res) {
          setCookie("token", res.token, {
            path: "/",
            secure: false,
            sameSite: "none",
          });
          setCookie("userid", res.userId, {
            path: "/",
            secure: false,
            sameSite: "none",
          });
          const isInGame = await gameService.gameInProgress(
            socketService.socket,
            res.token,
            res.userId
          );
          if (isInGame.status) {
            let user, component: any;
            if (Object.keys(isInGame.data.playerList).length > 0) {
              for (const player in isInGame.data.playerList) {
                if (
                  isInGame.data.playerList[player].user_id ===
                  Number(cookies.userid)
                ) {
                  user = isInGame.data.playerList[player];
                } else {
                  component = isInGame.data.playerList[player];
                }
              }
              setPlayerInfo(user);
              setGameInfo((prev: any) => ({
                ...prev,
                room: isInGame.data.room_id,
                type: isInGame.data.room_type,
                component: component,
                command_type: isInGame.data.command,
              }));
              socketService.socket?.emit("enter_room", isInGame.data.room_id);
              setIsLogin(true);
              setGameStarted(true);
            }
          } else {
            setIsLogin(true);
          }
        }
      }
    } catch (error) {
      setIsLogin(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const name = event.target.name;
    const value = event.target.value;
    setLoginInfo((values) => ({ ...values, [name]: value }));
  };

  return (
    <Portal id="login">
      <Backdrop>
        <ModalBody>
          <form autoComplete="off" className="form" onSubmit={onSubmitHandler}>
            <div className="control block-cube block-input">
              <input
                name="userId"
                placeholder="Username"
                type="text"
                value={loginInfo.userId}
                onChange={handleChange}
              />
              <div className="bg-top">
                <div className="bg-inner"></div>
              </div>
              <div className="bg-right">
                <div className="bg-inner"></div>
              </div>
              <div className="bg">
                <div className="bg-inner"></div>
              </div>
            </div>
            <div className="control block-cube block-input">
              <input
                name="address"
                placeholder="address"
                type="text"
                value={loginInfo.address}
                onChange={handleChange}
              />
              <div className="bg-top">
                <div className="bg-inner"></div>
              </div>
              <div className="bg-right">
                <div className="bg-inner"></div>
              </div>
              <div className="bg">
                <div className="bg-inner"></div>
              </div>
            </div>
            <button className="btn block-cube block-cube-hover" type="submit">
              <div className="bg-top">
                <div className="bg-inner"></div>
              </div>
              <div className="bg-right">
                <div className="bg-inner"></div>
              </div>
              <div className="bg">
                <div className="bg-inner"></div>
              </div>
              <div className="text">Log In</div>
            </button>
          </form>
        </ModalBody>
      </Backdrop>
    </Portal>
  );
}

export default Login;
