import React, { useEffect, useState } from "react";
import { Texture } from "pixi.js";
import * as PIXI from "pixi.js";
import { Container, AnimatedSprite } from "@inlet/react-pixi";
const attackSheet = "knight/attack.json";
const positioSheet = "knight/position.json";
const deadSheet = "knight/die.json";
const positionReverseSheet = "knight/position_reverse.json";
const attackReverseSheet = "knight/attack_reverse.json";
const deadReverseSheet = "knight/die_reverse.json";
const hurtSheet = "knight/hurt.json";
const hurtReverseSheet = "knight/hurt_reverse.json";
interface KnightProps {
  texture: string;
}

function Knight({ texture }: KnightProps) {
  const [frames, setFrames] = useState<any>({});

  useEffect(() => {
    const pixiLoader = PIXI.Loader.shared;
    pixiLoader.reset();
    pixiLoader
      .add(attackSheet)
      .add(positioSheet)
      .add(deadSheet)
      .add(positionReverseSheet)
      .add(attackReverseSheet)
      .add(deadReverseSheet)
      .add(hurtSheet)
      .add(hurtReverseSheet)
      .load((_, resource) => {
        const attackFrame = Object.keys(resource[attackSheet].data.frames).map(
          (frame) => Texture.from(frame)
        );
        const positioFrame = Object.keys(
          resource[positioSheet].data.frames
        ).map((frame) => Texture.from(frame));

        const deadFrame = Object.keys(resource[deadSheet].data.frames).map(
          (frame) => Texture.from(frame)
        );
        const positionReverseFrame = Object.keys(
          resource[positionReverseSheet].data.frames
        ).map((frame) => Texture.from(frame));

        const attackReverseFrame = Object.keys(
          resource[attackReverseSheet].data.frames
        ).map((frame) => Texture.from(frame));

        const deadReverseFrame = Object.keys(
          resource[deadReverseSheet].data.frames
        ).map((frame) => Texture.from(frame));

        const hurtFrame = Object.keys(resource[hurtSheet].data.frames).map(
          (frame) => Texture.from(frame)
        );

        const hurtReverseFrame = Object.keys(
          resource[hurtReverseSheet].data.frames
        ).map((frame) => Texture.from(frame));

        setFrames({
          attack: attackFrame,
          position: positioFrame,
          dead: deadFrame,
          position_reverse: positionReverseFrame,
          attack_reverse: attackReverseFrame,
          dead_reverse: deadReverseFrame,
          hurt: hurtFrame,
          hurt_reverse: hurtReverseFrame,
        });
      });

    return () => {
      PIXI.utils.clearTextureCache();
    };
  }, []);

  if (!frames.attack || !frames.position || !frames.dead) {
    return null;
  }
  return (
    <Container position={[250, 100]}>
      <AnimatedSprite
        key={texture}
        animationSpeed={0.1}
        isPlaying={true}
        textures={frames[texture]}
        anchor={[0.2, 0.15]}
        scale={1}
        loop={["position", "position_reverse"].includes(texture) ? true : false}
        initialFrame={1}
      />
    </Container>
  );
}

export default Knight;
