import React, { useEffect, useState } from "react";
import { Texture } from "pixi.js";
import * as PIXI from "pixi.js";
import { Container, AnimatedSprite } from "@inlet/react-pixi";
const skillSheet = "effects/effect.json";

interface KnightProps {
  texture: string;
}

function Skill({ texture }: KnightProps) {
  const [frames, setFrames] = useState<any>({});

  useEffect(() => {
    const pixiLoader = PIXI.Loader.shared;
    pixiLoader.reset();
    pixiLoader
      .add(skillSheet)

      .load((_, resource) => {
        const skillFrame = Object.keys(resource[skillSheet].data.frames).map(
          (frame) => Texture.from(frame)
        );

        setFrames({
          skill: skillFrame,
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
        animationSpeed={0.25}
        isPlaying={true}
        textures={frames[texture]}
        anchor={[0.2, 0.15]}
        scale={1}
        loop={false}
        initialFrame={1}
      />
    </Container>
  );
}

export default Skill;
