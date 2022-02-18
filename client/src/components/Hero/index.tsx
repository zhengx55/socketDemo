import React, { useEffect, useState } from "react";
import { Texture } from "pixi.js";
import * as PIXI from "pixi.js";
import { Container, AnimatedSprite, useApp } from "@inlet/react-pixi";
const [width, height] = [700, 600];
const attackSheet = "knight/attack.json";
const positioSheet = "knight/position.json";
const deadSheet = "knight/dead.json";
interface KnightProps {
  texture: string;
}

function Knight({ texture }: KnightProps) {
  const [frames, setFrames] = useState<any>({});
  const app = useApp();
  useEffect(() => {
    const pixiLoader = app.loader;
    pixiLoader.reset();
    pixiLoader
      .add(attackSheet)
      .add(positioSheet)
      .add(deadSheet)
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
        setFrames({
          attack: attackFrame,
          position: positioFrame,
          dead: deadFrame,
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
    <Container x={width / 2} y={height / 2}>
      <AnimatedSprite
        key={texture}
        animationSpeed={0.2}
        isPlaying={true}
        textures={frames[texture]}
        anchor={1.3}
        scale={0.3}
        loop={texture === "position" ? true : false}
        initialFrame={1}
      />
    </Container>
  );
}

export default Knight;
