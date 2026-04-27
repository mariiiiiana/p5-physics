class Brush {
  constructor(x, y, r) {
    this.radius = r;
    this.body = Matter.Bodies.circle(x, y, r);
    this.body.restitution = 0.9;
    this.body.frictionAir = 0.002;
    this.color = color(random(255), random(255), random(255));
    // collision categories: default(0x0001), brush(0x0002), particle(0x0004)
    const CATEGORY_DEFAULT = 0x0001;
    const CATEGORY_BRUSH = 0x0002;
    this.body.collisionFilter = { category: CATEGORY_BRUSH, mask: CATEGORY_DEFAULT | CATEGORY_BRUSH };

    // subscrribe to collision events
    Matter.Events.on(engine, 'collisionStart', (event) => {
      let pairs = event.pairs;
      for (let pair of pairs) {
        if (pair.bodyA === this.body || pair.bodyB === this.body) {
          let other = pair.bodyA === this.body ? pair.bodyB : pair.bodyA;
          this.changeColor();
          this.explode(other);
        }
      }
    });

}


  show() {
    this.keepInBounds();
    noStroke();
    fill(this.color);
    circle(this.body.position.x, this.body.position.y, this.radius * 2);
  }

  changeColor() {
    this.color = color(random(255), random(255), random(255));
  }

  explode(otherBody) {
    // apply radial impulse to both bodies
    if (!otherBody || !otherBody.position) return;
    let ax = this.body.position.x;
    let ay = this.body.position.y;
    let bx = otherBody.position.x;
    let by = otherBody.position.y;

    let dx = ax - bx;
    let dy = ay - by;
    let dist = sqrt(dx * dx + dy * dy) || 1;
    let nx = dx / dist;
    let ny = dy / dist;

    // force magnitude tuned for visual effect
    let force = 0.03;
    Matter.Body.applyForce(this.body, this.body.position, { x: nx * force, y: ny * force });
    Matter.Body.applyForce(otherBody, otherBody.position, { x: -nx * force, y: -ny * force });

    // spawn physical particles (Matter bodies) and add to global particles array
    if (typeof particles !== 'undefined') {
      let px = (ax + bx) / 2;
      let py = (ay + by) / 2;
      let col = this.color || color(255, 200, 0);
      const CATEGORY_DEFAULT = 0x0001;
      const CATEGORY_PARTICLE = 0x0004;
      // spawn fewer particles to preserve framerate
      for (let i = 0; i < 5; i++) {
        let angle = random(TWO_PI);
        let speed = random(1, 3);
        let vx = cos(angle) * speed + nx * 0.8;
        let vy = sin(angle) * speed + ny * 0.8;
        let size = random(3, 5);
        let body = Matter.Bodies.circle(px, py, size, { restitution: 0.25, frictionAir: 0.06 });
        Matter.Body.setMass(body, 0.002);
        // particles should not collide with brushes or other particles; only collide with default world (obstacles)
        body.collisionFilter = { category: CATEGORY_PARTICLE, mask: CATEGORY_DEFAULT };
        Matter.Body.setVelocity(body, { x: vx, y: vy });
        Matter.World.add(engine.world, body);
        particles.push({ body: body, life: 60, maxLife: 60, size: size, col: col });
      }
    }
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