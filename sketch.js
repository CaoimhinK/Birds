
var xam = 400;

function sigmoid(x) {
  return (1/(1+math.exp(-x))*2-1);
}

function linear(x) {
  return constrain(x,-1,1);
}

class Brain {
  constructor(mat1, mat2, mat3, mat4) {
    if (!(mat1 && mat2 && mat3 && mat4)) {
      let mat1 = [];
      for (let i = 0; i < 5; i++) {
        let row = [];
        for (let j = 0; j < 10; j++) {
          row.push(random()*2-1);
        }
        mat1.push(row);
      }
      this.mat1 = math.matrix(mat1);
      let mat2 = [];
      for (let i = 0; i < 10; i++) {
        let row = [];
        for (let j = 0; j < 10; j++) {
          row.push(random()*2-1);
        }
        mat2.push(row);
      }
      this.mat2 = math.matrix(mat2);
      let mat3 = [];
      for (let i = 0; i < 10; i++) {
        let row = [];
        for (let j = 0; j < 10; j++) {
          row.push(random()*2-1);
        }
        mat3.push(row);
      }
      this.mat3 = math.matrix(mat3);
      let mat4 = [];
      for (let i = 0; i < 10; i++) {
        let row = [];
        for (let j = 0; j < 3; j++) {
          row.push(random()*2-1);
        }
        mat4.push(row);
      }
      this.mat4 = math.matrix(mat4);
    } else {
      this.mat1 = mat1;
      this.mat2 = mat2;
      this.mat3 = mat3;
      this.mat4 = mat4;
    }
  }

  setInput(input) {
    this.input = math.matrix(input);
  }

  process() {
    let hidden1 = math.multiply(this.input, this.mat1);
    hidden1 = hidden1.map((value, index, matrix) => {
      return linear(value);
    });
    let hidden2 = math.multiply(hidden1, this.mat2);
    hidden2 = hidden2.map((value, index, matrix) => {
      return linear(value);
    });
    let hidden3 = math.multiply(hidden2, this.mat3);
    hidden3 = hidden3.map((value, index, matrix) => {
      return linear(value);
    });
    this.output = math.multiply(hidden3, this.mat4);
  }

  getOutput() {
    return this.output;
  }

  copy() {
    return new Brain(this.mat1, this.mat2, this.mat3, this.mat4);
  }

  mutate() {
    this.mat1 = math.map(this.mat1, (value) => {
      const chance = random();
      if (chance < 0.05) {
        return value + random(-0.5, 0.5);
      }
      return value;
    });
    this.mat2 = math.map(this.mat2, (value) => {
      const chance = random();
      if (chance < 0.05) {
        return value + random(-0.5, 0.5);
      }
      return value;
    });
    this.mat3 = math.map(this.mat3, (value) => {
      const chance = random();
      if (chance < 0.05) {
        return value + random(-0.5, 0.5);
      }
      return value;
    });
    this.mat4 = math.map(this.mat4, (value) => {
      const chance = random();
      if (chance < 0.05) {
        return value + random(-0.5, 0.5);
      }
      return value;
    });
  }
}


class Bird {
  constructor(pos, brain, col) {
    this.pos = pos || createVector(width/2,height/2);
    this.vel = createVector(0,0);
    this.acc = createVector(0,0);
    this.brain = brain || new Brain();
    this.color = col || color(0,100,100);
  }

  update(targetPosition) {
    let targetDirection = p5.Vector.sub(targetPosition, this.pos);
    let distanceInput = targetDirection.mag()/(width*width);
    let dirInput = p5.Vector.sub(targetDirection.normalize(), this.vel.normalize());
    let velNorm = this.vel.normalize();
    this.brain.setInput([velNorm.x, velNorm.y, dirInput.x, dirInput.y, distanceInput]);
    this.brain.process();
    let [directionX, directionY, magnitude] = this.brain.getOutput().toArray();
    this.acc = createVector(directionX, directionY);
    this.acc.setMag(magnitude);
    this.vel.add(this.acc);
    this.vel.limit(3);
    this.pos.add(this.vel);
  }

  show() {
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, 5,5);
  }

  reproduce() {
    const newBrain = this.brain.copy();
    newBrain.mutate();
    let newHue = hue(this.color) + 10;
    return new Bird(null, newBrain, color(newHue, 100, 100));
  }

  computeFitness(target) {
    this.fitness = 1/p5.Vector.dist(this.pos, target);
  }
}

var birds;
var target;
var cycleTime;

function setup() {
  createCanvas(500,500);
  noStroke();
  colorMode(HSB, 360, 100, 100);
  frameRate(60);
  birds = [];
  cycleTime = 0;

  for (let i = 0; i < xam; i++) {
    birds[i] = new Bird(createVector(width/2, height/2));
  }
  target = createVector(random(width), random(height));
}

function draw() {
  background(0);
  for (let i = 0; i < birds.length; i++) {
    birds[i].update(target);
    birds[i].show();
  }
  fill(0,0,100);
  ellipse(target.x, target.y, 5,5);
  if (cycleTime >= 5000) {
    birds.forEach((bird) => {
      bird.computeFitness(target);
    });
    birds.sort((bird, other) => {
      return other.fitness - bird.fitness;
    });
    console.log(birds[0].fitness);
    const newBirds = [];
    const oldBirds = [];
    for (let i = 0; i < xam/4; i++) {
      oldBirds.push(new Bird(null, birds[i].brain.copy()))
      for (let j = 0; j < (xam/4)-i; j++) {
        newBirds.push(birds[i]);
      }
    }
    birds = oldBirds;
    for (let i = 0; i < 3*xam/4; i++) {
      birds.push(random(newBirds).reproduce());
    }
    cycleTime = 0;
    target = createVector(random(width), random(height));
  }
  cycleTime += deltaTime;
}
