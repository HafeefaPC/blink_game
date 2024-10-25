import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const EYE_AR_THRESH = 0.3;
const EYE_AR_CONSEC_FRAMES = 3;

let blinkCounter = 0;
let counter = 0;
let lastEAR = 1.0;

export async function setupYolo() {
  await tf.ready();
  await tf.setBackend('webgl');
  const model = await tf.loadGraphModel('/models/yolov5n-face/model.json');
  return model;
}

export async function detectBlinks(video, model) {
  const tensor = tf.browser.fromPixels(video);
  const resized = tf.image.resizeBilinear(tensor, [640, 640]);
  const normalized = resized.div(255.0);
  const batched = normalized.expandDims(0);

  const predictions = await model.executeAsync(batched);
  const boxes = await predictions[0].array();
  const scores = await predictions[1].array();

  tf.dispose([tensor, resized, normalized, batched, ...predictions]);

  const blinks = processBlinks(boxes[0], scores[0]);
  return blinks;
}

function processBlinks(boxes, scores) {
  const eyeBoxes = [];
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > 0.5) {
      const [y1, x1, y2, x2] = boxes[i];
      eyeBoxes.push([x1, y1, x2, y2]);
    }
  }

  if (eyeBoxes.length === 2) {
    const ear = calculateEAR(eyeBoxes[0], eyeBoxes[1]);
    if (ear < EYE_AR_THRESH) {
      counter += 1;
    } else {
      if (counter >= EYE_AR_CONSEC_FRAMES) {
        blinkCounter += 1;
      }
      counter = 0;
    }
    lastEAR = ear;
  }

  return blinkCounter;
}

function calculateEAR(leftEye, rightEye) {
  const leftEAR = (leftEye[3] - leftEye[1]) / (leftEye[2] - leftEye[0]);
  const rightEAR = (rightEye[3] - rightEye[1]) / (rightEye[2] - rightEye[0]);
  return (leftEAR + rightEAR) / 2.0;
}