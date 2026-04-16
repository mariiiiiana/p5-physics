let Engine = Matter.Engine,
    Composite = Matter.Composite;

let engine;

let brush;

let brushes = [];

let obstacle;

let NUM_BRUSHES = 100;


function setup() {
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create();

  for (let i = 0; i < NUM_BRUSHES; i++) {
    let size = random(10, 30);
    brush = new Brush(width / 2, height / 4, size);
    brushes.push(brush);
    Composite.add(engine.world, brush.body);
  }

  obstacle = new Obstacle(width / 2, 600, 300, 50,{ isStatic: true },
    PI / 4
  );

  Composite.add(engine.world, obstacle.body);
}

function draw() {
  // background(220);

  Engine.update(engine);

  for (let i = 0; i < brushes.length; i++) {
    brushes[i].show();
  }

  obstacle.show();
}