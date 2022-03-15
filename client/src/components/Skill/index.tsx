import React, { useEffect, useState } from "react";
import { Texture } from "pixi.js";
import * as PIXI from "pixi.js";
import { Container, AnimatedSprite } from "@inlet/react-pixi";

const skillSheet = "effects/effect.json";

interface SkillProps {
  texture: string;
}

function Skill({ texture }: SkillProps) {
  const [frames, setFrames] = useState<any>({});

  useEffect(() => {
    const pixiLoader = PIXI.Loader.shared;
    pixiLoader.reset();
    pixiLoader.add(skillSheet).load((_, resource) => {
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

  if (!frames.skill) {
    return null;
  }
  return (
    <Container position={[250, 100]}>
      <AnimatedSprite
        key={texture}
        animationSpeed={0.15}
        isPlaying={true}
        textures={frames[texture]}
        anchor={[0.1, -0.5]}
        scale={2}
        loop={true}
        initialFrame={1}
      />
    </Container>
  );
}

export default Skill;
