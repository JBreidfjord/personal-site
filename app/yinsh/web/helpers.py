import json
from random import choice

from app.yinsh.yinsh.game import GameState, Move
from app.yinsh.yinsh.helpers import coordinate_index
from app.yinsh.yinsh.types import Hex, IllegalMoveError, Marker, Player, Ring

content_index = {None: 0, Ring.WHITE: 1, Ring.BLACK: 2, Marker.WHITE: 3, Marker.BLACK: 4}
inv_content_index = {v: k for k, v in content_index.items()}


def handle_place(hex: Hex, game: GameState):
    if game.is_over() or not game.requires_setup:
        return
    move = Move.place(hex)
    try:
        game.make_move(move)
        return dump_data(game)
    except IllegalMoveError:
        return


def handle_play(src_hex: Hex, dst_hex: Hex, game: GameState):
    if game.is_over() or game.requires_setup:
        return
    move = Move.play(src_hex, dst_hex)
    try:
        game.make_move(move)
        return dump_data(game)
    except IllegalMoveError:
        return


def handle_dsts(hex: Hex, game: GameState):
    if game.is_over() or game.requires_setup:
        return
    valid_dsts = [
        coordinate_index[move.dst_hex] for move in game.legal_moves if move.src_hex == hex
    ]
    if valid_dsts:
        return json.dumps(valid_dsts)


def handle_bot(game: GameState):
    game.next_player = game.next_player.other  # Flip to bot
    move = choice(list(game.legal_moves))
    game.make_move(move)
    return dump_data(game)


def handle_bot_row(game: GameState):
    game.next_player = game.next_player.other  # Flip to bot
    row = choice(game.board.get_rows(game.next_player))
    hex = choice(
        [hex for hex in game.board.rings if game.board.rings[hex].value == game.next_player.value]
    )
    game.complete_row(row)
    game.remove_ring(hex)
    return dump_data(game)


def handle_row(data: dict):
    row = [Hex(*hex.values()) for hex in data["row"]]
    game = GameState.parse_state(data["state"])
    game.complete_row(row)
    return dump_data(game)


def handle_ring(hex: Hex, game: GameState):
    game.remove_ring(hex)
    return dump_data(game)


def get_rows(game: GameState):
    white = [[coordinate_index[hex] for hex in row] for row in game.board.get_rows(Player.WHITE)]
    black = [[coordinate_index[hex] for hex in row] for row in game.board.get_rows(Player.BLACK)]
    return {"w": white, "b": black}


def get_outcome(game: GameState):
    outcome = game.outcome()
    if outcome is None:
        return
    if outcome.winner == "DRAW":
        return json.dumps(outcome.winner)
    return json.dumps(outcome.winner.value)


def parse_data(data: dict):
    hex = data.get("action")
    if hex is not None:
        hex = Hex(*hex.values())
    game = GameState.parse_state(data["state"])
    return hex, game


def parse_play_data(data: dict):
    action = data["action"]
    src_hex = Hex(*action["src"].values())
    dst_hex = Hex(*action["dst"].values())
    game = GameState.parse_state(data["state"])
    return src_hex, dst_hex, game


def dump_data(game: GameState):
    grid = {
        coordinate_index[hex]: content_index[content] for hex, content in game.board._grid.items()
    }
    data = {
        "state": {
            "grid": grid,
            "rings": {"white": game.players.white.rings, "black": game.players.black.rings},
            "requiresSetup": game.requires_setup,
            "rows": get_rows(game),
            "over": game.is_over(),
        }
    }
    return json.dumps(data)
