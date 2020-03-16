
var xam = 400;

function sigmoid(x) {
  return (1/(1+math.exp(-x))*2-1);
}

function linear(x) {
  return constrain(x,-1,1);
}

class Brain {
  constructor(mats, inputLength, numHidden, hiddenLength, outputLength) {
    if (!mats) {
      this.mats = [];

      this.mats.push(this.fromTo(inputLength, hiddenLength));

      for (let i = 0; i < numHidden; i++) {
        this.mats.push(this.fromTo(hiddenLength, hiddenLength));
      }

      this.mats.push(this.fromTo(hiddenLength, outputLength));
    } else {
      this.mats = mats;
    }
  }

  fromTo(from, to) {
    let mat = [];
    for (let i = 0; i < from; i++) {
      let row = [];
      for (let j = 0; j < to; j++) {
        row.push(random()*2-1);
      }
      mat.push(row);
    }
    return math.matrix(mat);
  }

  setInput(input) {
    this.input = math.matrix(input);
  }

  processLayer(mat1, mat2) {
    let layer = math.multiply(mat1, mat2);
    return layer.map((value, index, matrix) => {
      return linear(value);
    });
  }

  process() {

    let layer = this.input;
    for (let i = 0; i < this.mats.length; i++) {
      layer = this.processLayer(layer, this.mats[i]);
    }

    this.output = layer;
  }

  getOutput() {
    return this.output;
  }

  copy() {
    let newBrainMats = [];
    for (let i = 0; i < this.mats.length; i++) {
      newBrainMats.push(this.mats[i].clone());
    }
    return new Brain(newBrainMats);
  }

  mutateMat(mat) {
    return math.map(mat, (value) => {

      const chance = random();

      if (chance < 0.05) {
        return value + random(-0.5, 0.5);
      }

      return value;
    });
  }

  mutate() {
    for (let i = 0; i < this.mats.length; i++) {
      this.mats[i] = this.mutateMat(this.mats[i]);
    }
  }
}


class Bird {
  constructor(pos, brain, col) {
    this.pos = pos || createVector(width/2,height/2);
    this.vel = createVector(0,0);
    this.acc = createVector(0,0);
    this.brain = brain || new Brain(null, 5, 5, 10, 3);
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
