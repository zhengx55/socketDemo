import React, { useEffect, useState } from "react";
import { Texture } from "pixi.js";
import * as PIXI from "pixi.js";
import { Container, AnimatedSprite } from "@inlet/react-pixi";
const attackSheet = "knight/attack.json";
const positioSheet = "knight/position.json";
const deadSheet = "knight/dead.json";
const positionReverseSheet = "knight/reverse.json";
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

        setFrames({
          attack: attackFrame,
          position: positioFrame,
          dead: deadFrame,
          position_reverse: positionReverseFrame,
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
        animationSpeed={0.2}
        isPlaying={true}
        textures={frames[texture]}
        anchor={0}
        scale={0.5}
        loop={texture === "position" || "position_reverse" ? true : false}
        initialFrame={1}
      />
    </Container>
  );
}

export default Knight;
