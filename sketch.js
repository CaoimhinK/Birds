
function sigmoid(x) {
  return (1/(1+math.exp(-x))*2-1);
}

class Brain {
  constructor(mat1, mat2) {
    if (!(mat1 && mat2)) {
      let mat1 = [];
      for (let i = 0; i < 2; i++) {
        let row = [];
        for (let j = 0; j < 5; j++) {
          row.push(random()*2-1);
        }
        mat1.push(row);
      }
      this.mat1 = math.matrix(mat1);
      let mat2 = [];
      for (let i = 0; i < 5; i++) {
        let row = [];
        for (let j = 0; j < 2; j++) {
          row.push(random()*2-1);
        }
        mat2.push(row);
      }
      this.mat2 = math.matrix(mat2);
    } else {
      this.mat1 = mat1;
      this.mat2 = mat2;
    }
  }

  setInput(input) {
    this.input = math.matrix(input);
  }

  process() {
    let hidden = math.multiply(this.input, this.mat1);
    hidden = hidden.map((value, index, matrix) => {
      return sigmoid(value);
    });
    let out = math.multiply(hidden, this.mat2);
    let outVec = p5.Vector.fromAngle(out.get([0]));
    let outMag = out.get([1]);
    outVec.setMag(outMag);
    this.output = outVec;
  }

  getOutput() {
    return this.output;
  }

  copy() {
    return new Brain(this.mat1, this.mat2);
  }

  mutate() {
    this.mat1 = math.map(this.mat1, (value) => {
      const chance = random();
      if (chance < 0.05) {
        return value + random(0.5);
      }
      return value;
    });
    this.mat2 = math.map(this.mat2, (value) => {
      const chance = random();
      if (chance < 0.05) {
        return value + random(0.5);
      }
      return value;
    });
  }
}


class Bird {
  constructor(pos, brain) {
    this.pos = pos || createVector(0,0);
    this.vel = createVector(0,0);
    this.brain = brain || new Brain();
  }

  update(targetDirection) {
    let dirVec = targetDirection.normalize();
    this.brain.setInput([dirVec.x, dirVec.y]);
    this.brain.process();
    this.vel = this.brain.getOutput();
    this.pos.add(this.vel);
  }

  show() {
    ellipse(this.pos.x, this.pos.y, 10,10);
  }

  reproduce() {
    const newBrain = this.brain.copy();
    newBrain.mutate();
    return new Bird(createVector(0,0), newBrain);
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
  fill(255);
  frameRate(60);
  birds = [];
  cycleTime = 0;

  for (let i = 0; i < 50; i++) {
    birds[i] = new Bird(createVector(0, 0));
  }
  target = createVector(mouseX, mouseY);
}

function draw() {
  background(0);
  for (let i = 0; i < birds.length; i++) {
    birds[i].update(p5.Vector.sub(target,birds[i].pos));
    birds[i].show();
  }
  target = createVector(mouseX, mouseY);
  if (cycleTime >= 5000) {
    birds.forEach((bird) => {
      bird.computeFitness(target);
    });
    birds.sort((bird, other) => {
      return other.fitness - bird.fitness;
    });
    const newBirds = [];
    birds.slice(0, birds.length/2).forEach((bird) => {
      bird.pos = createVector(0,0);
      newBirds.push(bird);
      newBirds.push(bird.reproduce());
    });
    birds = newBirds;
    cycleTime = 0;
  }
  cycleTime += deltaTime;
}
