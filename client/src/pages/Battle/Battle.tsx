import React from "react";
import styled from "styled-components";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Typography } from "../Match";

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-image: url(/img/bg.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 101% 100%;
  flex-direction: column;
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

const BattleContainer = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, 33%);
  /* grid-template-rows: 100px 200px; */
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
  }
  .button {
  }
  .button_bar {
  }
  .launch {
  }
`;

function Battle() {
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
        <section className="score_panel"></section>
        <section className="player">
          <LazyLoadImage
            alt=""
            className="character"
            src="/img/character/Knight.png"
            effect="blur"
          />
        </section>
        <div className="button"></div>
        <div className="button_bar"></div>
        <div className="launch"></div>
      </BattleContainer>
    </Container>
  );
}

export default React.memo(Battle);
