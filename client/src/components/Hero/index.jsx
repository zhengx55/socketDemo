import React, { useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { Container, AnimatedSprite, useApp } from "@inlet/react-pixi";
// function Knight() {
//   useEffect(() => {
//     const app = InitStage();
//     return () => {
//       app.stop();
//       document.body.removeChild(app.view);
//     };
//   }, []);

//   const InitStage = () => {
//     const app = new Application({
//       width: 800,
//       height: 800,
//       antialias: true,
//       resolution: 1,
//       backgroundColor: 0x1d9ce0,
//     });
//     document.body.appendChild(app.view);
//     const loader = Loader.shared;
//     loader.add("spritesheet", attackImg).load(setUp);

//     function setUp() {
//       const texture = loader.resources["spritesheet"].texture.baseTexture;
//       const sheet = new Spritesheet(texture, attackSheet);
//       let testures = [];
//       sheet.parse((textures) => {
//         console.log(Object.keys(textures).length);
//         const texturesSize = Object.keys(textures).length;
//         for (let i = 1; i <= texturesSize; i++) {
//           console.log(typeof textures[`Attack${i}.png`]);
//           // const texture = Texture.from(textures[`Attack${i}.png`]);
//           testures.push(textures[`Attack${i}.png`]);
//         }
//         console.log(testures);
//         const knight = new AnimatedSprite(textures);
//         knight.position.set(100, 100);
//         app.stage.addChild(knight);
//         knight.start();
//       });
//     }
//     return app;
//   };

//   return <></>;
// }

// export default Knight;

const [width, height] = [800, 600];
const attackSheet = "knight/attack.json";
function Knight() {
  const [frames, setFrames] = useState([]);
  const app = useApp();

  useEffect(() => {
    app.loader.add(attackSheet).load((_, resource) => {
      setFrames(
        Object.keys(resource[attackSheet].data.frames).map(
          (frame) => new PIXI.Texture.from(frame)
        )
      );
    });
    return () => {
      app.loader.remove(attackSheet);
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
