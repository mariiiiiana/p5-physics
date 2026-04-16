class Brush {
  constructor(x, y, r) {
    this.radius = r;
    this.body = Matter.Bodies.circle(x, y, r);
    this.body.restitution = 0.9;
    this.color = color(random(255), random(255), random(255));
  }

  show() {
    this.keepInBounds();
    noStroke();
    fill(this.color);
    circle(this.body.position.x, this.body.position.y, this.radius * 2);
  }

  keepInBounds() {
    let pos = this.body.position;
    let vel = this.body.velocity;
    let r = this.body.circleRadius;

    if (pos.x < r) {
      Matter.Body.setPosition(this.body, { x: r, y: pos.y });
      Matter.Body.setVelocity(this.body, { x: -vel.x, y: vel.y });
    }

    if (pos.x > width - r) {
      Matter.Body.setPosition(this.body, { x: width - r, y: pos.y });
      Matter.Body.setVelocity(this.body, { x: -vel.x, y: vel.y });
    }

    if (pos.y < r) {
      Matter.Body.setPosition(this.body, { x: pos.x, y: r });
      Matter.Body.setVelocity(this.body, { x: vel.x, y: -vel.y });
    }

    if (pos.y > height - r) {
      Matter.Body.setPosition(this.body, { x: pos.x, y: height - r });
      Matter.Body.setVelocity(this.body, { x: vel.x, y: -vel.y });
    }
  }
}