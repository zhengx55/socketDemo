import { useState, useEffect } from "react";
import { Container, AnimatedSprite, useApp, useTick } from "@inlet/react-pixi";

const [width, height] = [500, 500];
const spritesheet =
  "https://pixijs.io/examples/examples/assets/spritesheet/fighter.json";

const Knight = () => {
  const [frames, setFrames] = useState([]);
  const [rot, setRot] = useState(0);
  const app = useApp();

  useTick((delta) => setRot((r) => r + 0.01 * delta));

  // load
  useEffect(() => {
    app.loader.add(spritesheet).load((_, resource) => {
      setFrames(
        Object.keys(resource[spritesheet].data.frames).map((frame) =>
          PIXI.Texture.from(frame)
        )
      );
    });
  }, []);

  if (frames.length === 0) {
    return null;
  }

  return (
    <Container rotation={rot} x={width / 2} y={height / 2}>
      <AnimatedSprite
        animationSpeed={0.5}
        isPlaying={true}
        textures={frames}
        anchor={0.5}
      />
    </Container>
  );
};

export default Knight;
