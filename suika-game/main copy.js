import { Engine, Render, Runner, Bodies, World, Body, Events} from "matter-js";
import { FRUITS_BASE, FRUITS_HLW } from "./fruits";

let THEME = "base"; // { base, halloween }
let FRUITS = FRUITS_BASE;

switch (THEME) {
  case "halloween":
    FRUITS = FRUITS_HLW;
    break;
  default:
    FRUITS = FRUITS_BASE;
}

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 620,
    height: 850,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  isStatic: true,
  isSensor: true, // 걸려도 넘어가게
  render: { fillStyle: "#E6B143" }

});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true, //준비중 상태
    render: {
      sprite: { texture: `${fruit.name}.png` }
    },
    restitution: 0.2, //통통 튀도록 설정
  });


  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {
  if(disableAction){
    return;
  }

  switch(event.code){
    case "KeyA":
      Body.setPosition(currentBody, {
        x: currentBody.position.x - 10,
        y: currentBody.position.y
      });
      break;

    case "KeyD":
      Body.setPosition(currentBody, {
        x: currentBody.position.x + 10,
        y: currentBody.position.y
      });
      break;

    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);

      addFruit();
      break;
  }
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if(collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      if ( index === FRUITS.length -1){
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];
      const newBody = Bodies.circle(
        collision.collision.supprots[0].x,
        collision.collision.supports[0].y,
        newFruit.radius, 
        {
          render: { 
            sprite: {texture: '${newFruit.name}.png' }
          },
          index: index + 1,
        }
      );

      World.add(world, newBody)
    }
  });
});

addFruit();