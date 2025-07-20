import { Game } from './game.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

let game;

function init() {
  const canvas = document.getElementById('game-canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');

  game = new Game(canvas, ctx);

  document.getElementById('restart-button').addEventListener('click', () => {
    game.restart();
  });

  game.start();
}

document.addEventListener('DOMContentLoaded', init);
