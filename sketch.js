let Engine = Matter.Engine,
    Composite = Matter.Composite,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

let engine;
let canvas;
let brushes = [];
let particles = [];
let mirroredObstacle;

let NUM_BRUSHES = 30;
let tiltX = 0;
let tiltY = 0;
let hasOrientationData = false;
let mouse;
let mouseConstraint;

// pixelated rendering
let gfx;
const PIXEL_SCALE = 8;
const PALETTE = [];

function pickPalette() {
  return random(PALETTE);
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  engine = Engine.create();
  engine.world.gravity.scale = 0.008;

  // palette (retro-ish)
  PALETTE.push(color(0, 0, 0));
  PALETTE.push(color(29, 43, 83));
  PALETTE.push(color(126, 37, 83));
  PALETTE.push(color(0, 135, 81));
  PALETTE.push(color(171, 82, 54));
  PALETTE.push(color(255, 119, 168));
  PALETTE.push(color(255, 204, 60));
  PALETTE.push(color(255, 255, 255));

  // create low-res buffer
  let lowW = max(16, floor(width / PIXEL_SCALE));
  let lowH = max(16, floor(height / PIXEL_SCALE));
  gfx = createGraphics(lowW, lowH);
  gfx.noSmooth();
  gfx.pixelDensity(1);

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    // Auto-request permission on iOS 13+ at startup
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(permissionState => {
        if (permissionState === 'granted') {
          console.log('Orientation permission granted');
        }
      }).catch(err => {
        console.log('Orientation permission not available or denied');
      });
    }
  }

  // enable touch / mouse interaction with Matter bodies
  mouse = Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
  });
  Composite.add(engine.world, mouseConstraint);

  for (let i = 0; i < NUM_BRUSHES; i++) {
    let size = random(10, 30);
    let b = new Brush(random(width), random(height / 2), size);
    brushes.push(b);
    Composite.add(engine.world, b.body);
  }

  // mirrored obstacle on opposite side
  mirroredObstacle = new Obstacle(width - width / 2, 600, 300, 50, { isStatic: true }, -PI / 4);
  Composite.add(engine.world, mirroredObstacle.body);

  // request sensors button (iOS)
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
  // draw to low-res buffer for pixelated effect; use slight alpha for trails
  gfx.background(0, 20);

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

  // draw brushes to low-res buffer
  for (let i = 0; i < brushes.length; i++) {
    brushes[i].show(gfx);
  }

  // draw obstacles (if any) - any obstacle.show should accept gfx
  if (typeof mirroredObstacle !== 'undefined' && mirroredObstacle) mirroredObstacle.show(gfx);

  // update and draw physical particles (Matter bodies) on gfx
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.life -= 1;
    let pos = p.body.position;
    // draw streaks on low-res buffer
    gfx.stroke(p.col.levels[0], p.col.levels[1], p.col.levels[2], map(p.life, 0, p.maxLife, 0, 255));
    gfx.strokeWeight(1);
    let prev = p.prev || { x: pos.x, y: pos.y };
    gfx.line(prev.x / PIXEL_SCALE, prev.y / PIXEL_SCALE, pos.x / PIXEL_SCALE, pos.y / PIXEL_SCALE);
    gfx.noStroke();
    gfx.fill(p.col.levels[0], p.col.levels[1], p.col.levels[2], map(p.life, 0, p.maxLife, 0, 180));
    gfx.circle(pos.x / PIXEL_SCALE, pos.y / PIXEL_SCALE, p.size);
    p.prev = { x: pos.x, y: pos.y };
    if (p.life <= 0) {
      Matter.World.remove(engine.world, p.body);
      particles.splice(i, 1);
    }
  }

  // draw the low-res buffer scaled up to the canvas
  noSmooth();
  image(gfx, 0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let lowW = max(16, floor(width / PIXEL_SCALE));
  let lowH = max(16, floor(height / PIXEL_SCALE));
  gfx = createGraphics(lowW, lowH);
  gfx.noSmooth();
  gfx.pixelDensity(1);
}
