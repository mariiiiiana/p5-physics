// class Obstacle {
  constructor(x, y, width, height, options = {}, angle = 0) {
    this.width = width;
    this.height = height;
    this.body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      ...options,
    });

    Matter.Body.setAngle(this.body, angle);
  }

  show(g) {
    let draw = g || window;
    draw.rectMode(draw.CENTER);
    draw.fill(0, 255, 0);

    draw.push();
    draw.translate(this.body.position.x / (typeof PIXEL_SCALE !== 'undefined' ? PIXEL_SCALE : 1),
                   this.body.position.y / (typeof PIXEL_SCALE !== 'undefined' ? PIXEL_SCALE : 1));
    draw.rotate(this.body.angle);
    draw.rect(0, 0, this.width / (typeof PIXEL_SCALE !== 'undefined' ? PIXEL_SCALE : 1), this.height / (typeof PIXEL_SCALE !== 'undefined' ? PIXEL_SCALE : 1));
    draw.pop();
  }
}