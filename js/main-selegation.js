import {
  getCellElementList,
  getCurrentTurnElement,
  getGameStatusElement,
  getCellElementAtIdx,
  getReplayElement,
  getCellListElement,
} from './selectors.js';
import { CELL_VALUE, GAME_STATUS, TURN } from './constants.js';
import { checkGameStatus } from './utils.js';
// console.log(checkGameStatus(['X', 'O', 'O', '', 'X', '', '', 'O', 'X']));
// console.log(getCellElementList());
// console.log(getCurrentTurnElement());
// console.log(getGameStatusElement());
// console.log(getCellElementAtIdx(5));

/**
 * Global variables
 */
let currentTurn = TURN.CROSS;
let isGameEnded = false;
let cellValues = new Array(9).fill('');
let gameStatus = GAME_STATUS.PLAYING;

function toggleTurn() {
  currentTurn = currentTurn === TURN.CIRCLE ? TURN.CROSS : TURN.CIRCLE;

  // update turn on DOM element
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(currentTurn);
  }
}

function updateGameStatus(newGameStatus) {
  gameStatus = newGameStatus;
  const gameStatusElement = getGameStatusElement();
  if (!gameStatusElement) return;
  gameStatusElement.textContent = newGameStatus;
}
function showReplayButton() {
  const replayButton = getReplayElement();
  if (!replayButton) return;
  replayButton.classList.add('show');
}
function hideReplayButton() {
  const replayButton = getReplayElement();
  if (!replayButton) return;
  replayButton.classList.remove('show');
}
function hightLightWinCells(winPosition) {
  if (!Array.isArray(winPosition) || winPosition.length !== 3) {
    throw new Error('Invalid position');
  }
  for (const position of winPosition) {
    const cell = getCellElementAtIdx(position);
    if (cell) cell.classList.add('win');
  }
}

function handleCellClick(cell, index) {
  const isEndGame = gameStatus !== GAME_STATUS.PLAYING;
  const isClick = cell.classList.contains(TURN.CIRCLE) || cell.classList.contains(TURN.CROSS);
  // only allow to click if game is playing and that cell is not click yet
  if (isClick || isEndGame) return;
  // set selected cell
  cell.classList.add(currentTurn);

  //update cellValue
  cellValues[index] = currentTurn === TURN.CIRCLE ? CELL_VALUE.CIRCLE : CELL_VALUE.CROSS;
  //toogle turn
  toggleTurn();

  //checkGame status
  const game = checkGameStatus(cellValues);
  switch (game.status) {
    case GAME_STATUS.ENDED: {
      // update game status
      // show replay button
      updateGameStatus(game.status);
      showReplayButton();
      break;
    }

    case GAME_STATUS.X_WIN:
    case GAME_STATUS.O_WIN: {
      // update game status
      // show replay button
      // hightlight win button
      updateGameStatus(game.status);
      showReplayButton();
      hightLightWinCells(game.winPositions);
      break;
    }

    default:
    //playing
  }
}

function initCellElementList() {
  // set index forEach element
  const liList = getCellElementList();
  liList.forEach((cell, index) => {
    cell.dataset.idx = index;
  });
  // attach event click event
  const ulEL = getCellListElement();
  if (ulEL) {
    ulEL.addEventListener('click', (event) => {
      if (event.target.tagName !== 'LI') return;
      const index = Number.parseInt(event.target.dataset.idx);

      handleCellClick(event.target, index);
    });
  }
}

function resetGame() {
  // reset global vars
  currentTurn = TURN.CROSS;
  gameStatus = GAME_STATUS.PLAYING;
  cellValues = cellValues.map(() => '');
  // reset DOM element
  // reset game status
  updateGameStatus(GAME_STATUS.PLAYING);
  // reset current turn
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(TURN.CROSS);
  }
  // reset game board
  const cellElementList = getCellElementList();
  for (const cellElement of cellElementList) {
    cellElement.className = '';
  }
  // hide replay
  hideReplayButton();
}

function initReplayButton() {
  const replayButton = getReplayElement();
  if (replayButton) {
    replayButton.addEventListener('click', resetGame);
  }
}
/**
 * TODOs
 *
 * 1. Bind click event for all cells
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */

(() => {
  // bind click event for all li element
  initCellElementList();
  // bind click event for replay button
  initReplayButton();
})();
