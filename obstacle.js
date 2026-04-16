class Obstacle {
  constructor(x, y, width, height, options = {}, angle = 0) {
    this.width = width;
    this.height = height;
    this.body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      ...options,
    });

    Matter.Body.setAngle(this.body, angle);
  }

  show() {
    rectMode(CENTER);
    fill(0, 255, 0);

    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    rect(0, 0, this.width, this.height);
    pop();
  }
}