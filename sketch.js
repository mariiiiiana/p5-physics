let Engine = Matter.Engine, // motore fisico
    Bodies = Matter.Bodies; //oggetti fisici
    Composite = Matter.Composite; // insieme di tutti i bodies

let engine;
let brush;


function setup() {
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create(); //creazione del motore

  brush = Bodies.circle (width / 2, height / 4, 50,); //creazione di un cerchio con rimbalzo

  Composite.add(engine.world, brush); //aggiunta del cerchio al mondo fisico
}

function draw() {
  background(220);

  noStroke();
  fill(255, 0, 0);
  circle( brush.position.x, brush.position.y, brush.circleRadius * 2); //disegno del cerchio

  Engine.update(engine); // aggiornamento del motore
}
