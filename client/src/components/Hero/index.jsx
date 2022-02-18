import React, { useEffect, useState } from "react";
import { Texture } from "pixi.js";
import { Container, AnimatedSprite, useApp } from "@inlet/react-pixi";
const [width, height] = [800, 600];
const attackSheet = "knight/attack.json";
function Knight() {
  const [frames, setFrames] = useState([]);
  const app = useApp();
  useEffect(() => {
    app.loader.add(attackSheet).load((_, resource) => {
      setFrames(
        Object.keys(resource[attackSheet].data.frames).map(
          (frame) => new Texture.from(frame)
        )
      );
    });

    return () => {
      //
      app.loader.reset();
    };
  }, []);

  if (frames.length === 0) {
    return null;
  }

  return (
    <Container x={width / 2} y={height / 2}>
      <AnimatedSprite
        animationSpeed={0.2}
        isPlaying={true}
        textures={frames}
        anchor={0.5}
      />
    </Container>
  );
}

export default Knight;
