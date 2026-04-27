let Engine = Matter.Engine,
    Composite = Matter.Composite;

let engine;

let brush;

let brushes = [];
let particles = [];

// let obstacle;

let NUM_BRUSHES = 30;
let tiltX = 0;
let tiltY = 0;
let hasOrientationData = false;
let mouse;
let mouseConstraint;


function setup() {
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  engine.world.gravity.scale = 0.008;

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
  }

  // enable touch / mouse interaction with Matter bodies
  mouse = Matter.Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();
  mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
  });
  Composite.add(engine.world, mouseConstraint);

  for (let i = 0; i < NUM_BRUSHES; i++) {
    let size = random(10, 30);
    brush = new Brush(width / 2, height / 4, size);
    brushes.push(brush);
    Composite.add(engine.world, brush.body);
  }

  // obstacle = new Obstacle(width / 2, 600, 300, 50,{ isStatic: true },
  //   PI / 4
  // );
  mirroredObstacle = new Obstacle(width - width / 2, 600, 300, 50, { isStatic: true },
    -PI / 4
  );

  // Composite.add(engine.world, obstacle.body);
  Composite.add(engine.world, mirroredObstacle.body);
  let button = createButton('Request Sensor Access');
  button.position(10, 10);
  button.mousePressed(() => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(permissionState => {
        if (permissionState === 'granted') {
          console.log('Orientation permission granted');
        }
      }).catch(console.error);
    }
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then(permissionState => {
        if (permissionState === 'granted') {
          console.log('Motion permission granted');
        }
      }).catch(console.error);
    }
    button.remove();
  });
}

function handleDeviceOrientation(event) {
  if (event.beta != null && event.gamma != null) {
    tiltX = event.gamma;
    tiltY = event.beta;
    hasOrientationData = true;
  }
}

function draw() {
  background(0, 25);

  let gravityX;
  let gravityY;

  if (hasOrientationData) {
    gravityX = constrain(map(tiltX, -45, 45, -2.1, 2.1), -2.1, 2.1);
    gravityY = constrain(map(tiltY, -45, 45, -2.1, 2.1), -2.1, 2.1);
  } else {
    gravityX = constrain(map(rotationY, -PI / 2, PI / 2, -2.1, 2.1), -2.1, 2.1);
    gravityY = constrain(map(rotationX, -PI / 2, PI / 2, -2.1, 2.1), -2.1, 2.1);
  }

  engine.world.gravity.x = gravityX;
  engine.world.gravity.y = gravityY;

  Engine.update(engine);

  for (let i = 0; i < brushes.length; i++) {
    brushes[i].show();
  }

  // obstacle.show();
  mirroredObstacle.show();

  // update and draw physical particles (Matter bodies)
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    let prevX = p.body.position.x;
    let prevY = p.body.position.y;
    p.life -= 1;
    let pos = p.body.position;
    stroke(p.col.levels[0], p.col.levels[1], p.col.levels[2], map(p.life, 0, p.maxLife, 0, 255));
    strokeWeight(2);
    line(prevX, prevY, pos.x, pos.y);
    noStroke();
    fill(p.col.levels[0], p.col.levels[1], p.col.levels[2], map(p.life, 0, p.maxLife, 0, 180));
    circle(pos.x, pos.y, p.size * 2);
    if (p.life <= 0) {
      Matter.World.remove(engine.world, p.body);
      particles.splice(i, 1);
    }
  }
}