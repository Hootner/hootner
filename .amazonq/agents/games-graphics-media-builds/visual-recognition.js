// Minimal Visual Recognition
class VisualRecognition {
  constructor() {
    this.patterns = new Map();
  }

  train(label, features) {
    this.patterns.set(label, features);
  }

  recognize(features) {
    let best = null;
    let minDist = Infinity;
    
    this.patterns.forEach((pattern, label) => {
      const dist = this.distance(features, pattern);
      if (dist < minDist) {
        minDist = dist;
        best = label;
      }
    });
    
    return best;
  }

  distance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }
}

const vr = new VisualRecognition();
vr.train('cat', [1, 0, 1]);
vr.train('dog', [0, 1, 1]);
console.log(vr.recognize([1, 0, 0.9]));

export default VisualRecognition;
