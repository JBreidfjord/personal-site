document.getElementById("select-white").onclick = function () {
  playerTurn = true;
  runGame();
};
document.getElementById("select-black").onclick = function () {
  playerTurn = false;
  runGame();
};
document.getElementById("select-random").onclick = function () {
  playerTurn = Math.random() < 0.5;
  runGame();
};

function colorSelect() {
  document.getElementById("canvas-container").style.display = "none";
  document.getElementById("rematch-container").style.display = "none";
  document.getElementById("select-container").style.display = "block";
}

function gameEnd(winner) {
  document.getElementById("rematch-container").style.display = "block";
  if (winner == "Draw") {
    document.getElementById("outcome").innerText = "Draw";
  } else {
    document.getElementById("outcome").innerText = `${winner} wins`;
  }
  document.getElementById("rematch").onclick = function () {
    colorSelect();
  };
  // Resets state for rematches
  state = {
    grid: {},
    color: color,
    variant: variant,
    rings: { white: 0, black: 0 },
    requiresSetup: true,
    rows: { w: [], b: [] },
  };
}
