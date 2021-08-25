let playerTurn;
let color;
let variant;
let state = {
  grid: {},
  color: color,
  variant: variant,
  rings: { white: 0, black: 0 },
  requiresSetup: true,
  rows: { w: [], b: [] },
};
let playHex = {};
let validDsts = [];

function runGame() {
  draw();

  state.variant = document.querySelector("input[name='variant']:checked").value;

  canvas.addEventListener("click", handleClick);
  if (!playerTurn) {
    state.color = "b";
    state.botColor = "w";
    botTurn();
  } else {
    state.color = "w";
    state.botColor = "b";
  }
}

function handleClick(e) {
  e.preventDefault();
  if (playerTurn) {
    canvas.removeEventListener("click", handleClick);
    let pos = getPosition(e);
    let hex = pixel_to_hex(pos.x, pos.y);
    if (state.requiresSetup) {
      placeMove(hex);
    } else {
      getValidDst(hex);
    }
  } else {
    return;
  }
}

function placeMove(hex) {
  let game = { action: hex, state: state };
  fetch("/yinsh/place", { method: "POST", body: JSON.stringify(game) })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Invalid response");
      }
      return response.json();
    })
    .then((data) => {
      let game = JSON.parse(data);
      state.grid = game.state.grid;
      state.over = game.state.over;
      state.requiresSetup = game.state.requiresSetup;
      endTurn();
    })
    .catch((error) => {
      console.error("Invalid move", error);
      canvas.addEventListener("click", handleClick);
    });
}

function playMove(srcHex, dstHex) {
  let game = { action: { src: srcHex, dst: dstHex }, state: state };
  fetch("/yinsh/play-dst", { method: "POST", body: JSON.stringify(game) })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Invalid response");
      }
      return response.json();
    })
    .then((data) => {
      let game = JSON.parse(data);
      state.grid = game.state.grid;
      state.rings = game.state.rings;
      state.rows = game.state.rows;
      state.over = game.state.over;
      canvas.removeEventListener("click", handleDstClick);
      endTurn();
    })
    .catch((error) => {
      console.error("Invalid move", error);
    });
}

function getValidDst(hex) {
  playHex.src = hex;
  let game = { action: hex, state: state };
  // Check if hex contains player's ring and only fetch if it is
  let hexContent =
    state.grid[invGridIndex.findIndex((h) => h.q == hex.q && h.r == hex.r)];
  if (
    (state.color == "w" && hexContent == 1) ||
    (state.color == "b" && hexContent == 2)
  ) {
    fetch("/yinsh/play-src", { method: "POST", body: JSON.stringify(game) })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid response");
        }
        return response.json();
      })
      .then((data) => {
        let dsts = JSON.parse(data);
        validDsts = dsts.map((i) => gridIndex[parseInt(i)]);
        validDsts.forEach((hex) => drawRing(hex, state.color == "w", 0.5));
        canvas.addEventListener("click", handleDstClick);
      })
      .catch((error) => {
        console.error("Invalid source hex", error);
        canvas.addEventListener("click", handleClick);
      });
  } else {
    canvas.removeEventListener("click", handleDstClick);
    canvas.addEventListener("click", handleClick);
  }
}

function handleDstClick(e) {
  e.preventDefault();
  let pos = getPosition(e);
  let hex = pixel_to_hex(pos.x, pos.y);
  // Check if hex exists in valid destinations
  if (validDsts.findIndex((dst) => dst.q == hex.q && dst.r == hex.r) != -1) {
    playMove(playHex.src, hex);
    // Check if hex is already selected
  } else if (hex.q == playHex.src.q && hex.r == playHex.src.r) {
    return;
  } else {
    canvas.removeEventListener("click", handleDstClick);
    canvas.addEventListener("click", handleClick);
    updateBoard();
    handleClick(e);
  }
}

function handleRows() {
  if (state.rows) {
    if (playerTurn) {
      if (state.rows[state.color].length !== 0) {
        canvas.addEventListener("mousemove", highlightRow);
        canvas.addEventListener("click", selectRow);
      }
      if (state.rows[state.botColor].length !== 0) {
        botRows();
      }
    } else {
      // Duplicate code to handle player ordering for edge cases where both
      // players get a completed row in the same turn.
      // Player whose turn it is has priority to select their row.
      if (state.rows[state.botColor].length !== 0) {
        botRows();
      }
      if (state.rows[state.color].length !== 0) {
        canvas.addEventListener("mousemove", highlightRow);
        canvas.addEventListener("click", selectRow);
      }
    }
  }
}

function selectRow(e) {
  let pos = getPosition(e);
  let hex = pixel_to_hex(pos.x, pos.y);
  state.rows[state.color].forEach((row) => {
    let hexRow = row.map((i) => gridIndex[parseInt(i)]);
    hexRow.forEach((h) => {
      if (h.q == hex.q && h.r == hex.r) {
        fetch("/yinsh/row", {
          method: "POST",
          body: JSON.stringify({ row: hexRow, state: state }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Invalid response");
            }
            return response.json();
          })
          .then((data) => {
            let game = JSON.parse(data);
            state.grid = game.state.grid;
            state.rows = game.state.rows;
            state.over = game.state.over;
            canvas.removeEventListener("mousemove", highlightRow);
            canvas.removeEventListener("click", selectRow);
            canvas.addEventListener("mousemove", highlightRing);
            canvas.addEventListener("click", selectRing);
            updateBoard();
            return; // Return to prevent overlapped rows from submitting multiple times
            // Should have a better method to prevent this
            // but this only applies if the selected hex is the overlapped hex
            // so ideally users would select non-overlapped hexes instead.
          })
          .catch((error) => {
            console.error("Invalid source hex", error);
          });
      }
    });
  });
}

function selectRing(e) {
  let pos = getPosition(e);
  let hex = pixel_to_hex(pos.x, pos.y);
  let hexContent =
    state.grid[invGridIndex.findIndex((h) => h.q == hex.q && h.r == hex.r)];
  if (
    (state.color == "w" && hexContent == 1) ||
    (state.color == "b" && hexContent == 2)
  ) {
    let game = { action: hex, state: state };
    fetch("/yinsh/ring", { method: "POST", body: JSON.stringify(game) })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid response");
        }
        return response.json();
      })
      .then((data) => {
        let game = JSON.parse(data);
        state.grid = game.state.grid;
        state.rings = game.state.rings;
        state.rows = game.state.rows;
        state.over = game.state.over;
        canvas.removeEventListener("mousemove", highlightRing);
        canvas.removeEventListener("click", selectRing);
        endTurn();
      })
      .catch((error) => {
        console.error("Invalid source hex", error);
      });
  }
}

function highlightRow(e) {
  updateBoard();
  let pos = getPosition(e);
  let hex = pixel_to_hex(pos.x, pos.y);
  state.rows[state.color].forEach((row) => {
    let hexRow = row.map((i) => gridIndex[parseInt(i)]);
    hexRow.forEach((h) => {
      if (h.q == hex.q && h.r == hex.r) {
        highlightMarkers(hexRow, state.color == "w");
      }
    });
  });
}

function highlightRing(e) {
  updateBoard();
  let pos = getPosition(e);
  let hex = pixel_to_hex(pos.x, pos.y);
  let hexContent =
    state.grid[invGridIndex.findIndex((h) => h.q == hex.q && h.r == hex.r)];
  if (
    (state.color == "w" && hexContent == 1) ||
    (state.color == "b" && hexContent == 2)
  ) {
    highlightRings(hex, state.color == "w");
  }
}

function endTurn() {
  updateBoard();
  if (state.rows.w.length !== 0 || state.rows.b.length !== 0) {
    handleRows();
  } else {
    if (state.over) {
      getOutcome();
      return;
    }
    if (playerTurn) {
      botTurn();
      playerTurn = false;
    } else {
      playerTurn = true;
    }
  }
}

function updateBoard() {
  draw();
  for (let i in state.grid) {
    let hex = gridIndex[parseInt(i)];
    switch (state.grid[i]) {
      case 0:
        break;
      case 1:
        drawRing(hex, true);
        break;
      case 2:
        drawRing(hex, false);
        break;
      case 3:
        drawMarker(hex, true);
        break;
      case 4:
        drawMarker(hex, false);
    }
  }
}

function botTurn() {
  fetch("/yinsh/bot", {
    method: "POST",
    body: JSON.stringify({ state: state }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Invalid response");
      }
      return response.json();
    })
    .then((data) => {
      let game = JSON.parse(data);
      state.grid = game.state.grid;
      state.rings = game.state.rings;
      state.rows = game.state.rows;
      state.over = game.state.over;
      state.requiresSetup = game.state.requiresSetup;
      canvas.addEventListener("click", handleClick);
      endTurn();
    })
    .catch((error) => {
      console.error("Invalid bot move", error);
    });
}

function botRows() {
  fetch("/yinsh/bot-row", {
    method: "POST",
    body: JSON.stringify({ state: state }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Invalid response");
      }
      return response.json();
    })
    .then((data) => {
      let game = JSON.parse(data);
      state.grid = game.state.grid;
      state.rings = game.state.rings;
      state.rows = game.state.rows;
      state.over = game.state.over;
      endTurn();
    })
    .catch((error) => {
      console.error("Invalid bot move", error);
    });
}

function getOutcome() {
  fetch("/yinsh/outcome", {
    method: "POST",
    body: JSON.stringify({ state: state }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Invalid response");
      }
      return response.json();
    })
    .then((data) => {
      let outcome = JSON.parse(data);
      if (outcome == "DRAW") {
        gameEnd("Draw");
      } else if (outcome == (state.color == "w")) {
        gameEnd("Player");
      } else {
        gameEnd("Bot");
      }
    })
    .catch((error) => {
      console.error("Game not over", error);
    });
}
