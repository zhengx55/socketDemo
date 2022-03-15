import React, { useEffect, useState } from "react";
import { Texture } from "pixi.js";
import * as PIXI from "pixi.js";
import { Container, AnimatedSprite } from "@inlet/react-pixi";

const skillSheet = "effects/effect.json";
interface SkillProps {
  texture: string;
  position: string;
}

function Skill({ texture, position }: SkillProps) {
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

  if (!frames.skill || !frames.blow) {
    return null;
  }
  return (
    <Container position={[250, 100]}>
      <AnimatedSprite
        key={texture}
        animationSpeed={0.15}
        isPlaying={true}
        textures={frames[texture]}
        anchor={position === "left" ? [0, -0.2] : [0.3, -0.2]}
        scale={2.5}
        loop={true}
        initialFrame={1}
      />
    </Container>
  );
}

export default Skill;
