import { Bodies, Engine, Render, Runner, World, Body, Events, Collision} from "matter-js";
import { FRUITS_BASE } from "./fruits";


// [형태 만들기]
const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#abf7f4",
    width: 620,
    height: 850
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#4271fc" }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#4271fc" }
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#4271fc" }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: 'topLine',
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#4271fc" }
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);


// [과일 생성]
let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let num_suika = 0;

function addFruit() {
  const index = Math.floor(Math.random() * 5); //랜덤으로 정함
  const fruit = FRUITS_BASE[index];

  const body = Bodies.circle(300, 70, fruit.radius, {
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

// [입력키에 따라 과일 이동 및 생성]
window.onkeydown = (event) => {
  if(disableAction) {
    return;
  }

  switch (event.code){
    case "KeyA":
      if (interval)
        return;
      
      interval = setInterval(() => {
        if(currentBody.position.x - currentFruit.radius > 30){
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
        }
      }, 5);
    
      break;

    case "KeyD":
      if (interval)
        return;

      interval = setInterval(() => {
        if(currentBody.position.x + currentFruit.radius < 590){
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
          });
        }
      }, 5);
    
      break;

    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      
      break;
  }
}


window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

// [충돌 판정]
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index){
      const index = collision.bodyA.index;

      // 수박일때는 동작X
      if( index === FRUITS_BASE.length -1){
        console.log('ddd');
        return;
      }

      //부딪힌 과일 지우기
      World.remove(world, [collision.bodyA, collision.bodyB]);

      // 충돌한 지점에 다음 과일 생성
      const newFruit = FRUITS_BASE[index + 1];
      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: { 
            sprite: { texture: `${newFruit.name}.png` }
          },
          index: index + 1,
        }
      );
      
      // 수박일 때 수박 count +1
      if( index === FRUITS_BASE.length -1){
        num_suika ++;
      }

      World.add(world, newBody);
    }

    //과일이 선에 닿도록 가득 차면 Game Over
    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")){
      alert("Game over");
      // !refresh 하는 코드 넣기
    }

    if(num_suika == 2){
      alert("Success!!!!");
    }
  });
});

addFruit();