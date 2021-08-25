from __future__ import annotations

from typing import Iterator

from app.yinsh.yinsh.board import Board
from app.yinsh.yinsh.helpers import inv_coordinate_index, valid_hexes
from app.yinsh.yinsh.types import (
    Direction,
    Hex,
    IllegalMoveError,
    Marker,
    Outcome,
    Player,
    Players,
    Ring,
)


class Move:
    def __init__(self, src_hex: Hex, dst_hex: Hex = None, is_starting: bool = False):
        if not (dst_hex is not None) ^ is_starting:
            raise ValueError("Move takes exactly 1 type of move as input")

        self.src_hex = src_hex
        self.dst_hex = dst_hex

        self.is_play = dst_hex is not None
        self.is_starting = is_starting

    @classmethod
    def play(cls, src_hex: Hex, dst_hex: Hex):
        return Move(src_hex, dst_hex)

    @classmethod
    def place(cls, hex: Hex):
        return Move(hex, is_starting=True)

    def __repr__(self):
        if self.is_play:
            return f"Move.play({self.src_hex}, {self.dst_hex})"
        else:
            return f"Move.place({self.src_hex})"

    def __hash__(self):
        return hash((self.src_hex, self.dst_hex))

    def __eq__(self, other: Move):
        return self.src_hex == other.src_hex and self.dst_hex == other.dst_hex


class MoveGenerator:
    def __init__(self, game: GameState):
        self.game = game

    def __iter__(self):
        return self._generate_legal_moves()

    def _generate_legal_moves(self) -> Iterator[Move]:
        yield from self._generate_starting() if self.game.requires_setup else self._generate_play()

    def _generate_starting(self):
        yield from [Move.place(hex) for hex in valid_hexes ^ set(self.game.board._grid.keys())]

    def _generate_play(self):
        for hex, ring in self.game.board.rings.items():
            if ring.value != self.game.next_player.value:
                continue
            # Iterate through each direction, checking each Hex
            # in that direction until an illegal move or the edge is found
            for direction in Direction:
                _prev_is_marker = False
                current_hex = hex + direction.value
                while current_hex in valid_hexes:
                    if self.game.board.rings.get(current_hex) is not None:
                        # Break from this direction upon reaching another ring
                        break

                    if self.game.board.markers.get(current_hex) is not None:
                        _prev_is_marker = True
                        current_hex += direction.value
                        continue  # Current Hex won't be valid so we can continue

                    # Current Hex must be empty if we reach this point
                    yield Move.play(hex, current_hex)
                    if _prev_is_marker:
                        # Break from this direction after first empty space following a marker
                        break

                    current_hex += direction.value

    def count(self):
        return len(list(self))


class GameState:
    def __init__(
        self,
        board: Board,
        players: Players,
        next_player: Player,
        variant: str,
        is_setup: bool = True,
    ):
        self.board = board
        self.players = players
        self.next_player = next_player
        self.variant = variant

        self.requires_setup = not is_setup
        self._rings_to_win = 1 if self.variant == "blitz" else 3

    @classmethod
    def new_game(cls, variant: str = "standard"):
        """
        Initializes a new game of YINSH
        
        Pass variant argument "blitz" for a shorter game,
        otherwise standard game length will be used
        """
        if variant not in ["standard", "blitz"]:
            raise ValueError("Variant must be 'standard', 'blitz', or not given")

        players = Players()
        players.white.set_rings(0)
        players.black.set_rings(0)

        return GameState(Board.empty(), players, players.white, variant, is_setup=False)

    @classmethod
    def parse_state(cls, state: dict):
        "Initializes a game of YINSH from a dict of game data"
        players = Players()
        players.white.set_rings(state["rings"]["white"])
        players.black.set_rings(state["rings"]["black"])
        player = players.white if state["color"] == "w" else players.black

        board = Board.empty()
        for i, content in state["grid"].items():
            hex = inv_coordinate_index[int(i)]
            if content == 0:
                continue
            elif content == 1:
                board._grid[hex] = Ring.WHITE
                board.rings[hex] = Ring.WHITE
            elif content == 2:
                board._grid[hex] = Ring.BLACK
                board.rings[hex] = Ring.BLACK
            elif content == 3:
                board._grid[hex] = Marker.WHITE
                board.markers[hex] = Marker.WHITE
            elif content == 4:
                board._grid[hex] = Marker.BLACK
                board.markers[hex] = Marker.BLACK

        is_setup = sum(state["rings"].values()) + len(board.rings) == 10
        return GameState(board, players, player, state["variant"], is_setup)

    def is_over(self):
        return (
            self.players.white.rings == self._rings_to_win
            or self.players.black.rings == self._rings_to_win
            or self.legal_moves.count() == 0
        )

    def outcome(self):
        if self.players.white.rings == self._rings_to_win:
            return Outcome(winner=Player.WHITE)
        elif self.players.black.rings == self._rings_to_win:
            return Outcome(winner=Player.BLACK)
        elif self.legal_moves.count() == 0:
            if self.players.white.rings == self.players.black.rings:
                return Outcome(winner="DRAW")
            else:
                return Outcome(
                    winner=Player.WHITE
                    if self.players.white.rings > self.players.black.rings
                    else Player.BLACK
                )

    def make_move(self, move: Move):
        if move.is_play and self.requires_setup:
            raise IllegalMoveError("Board requires setup")
        elif move.is_starting and not self.requires_setup:
            raise IllegalMoveError("Max rings reached")
        elif self.is_over():
            raise IllegalMoveError("Game is over")

        if move.is_starting:
            self.board.place_ring(self.next_player, move.src_hex)
            self.next_player = self.next_player.other
            white_rings, black_rings = self.board._get_ring_count()
            if white_rings == 5 and black_rings == 5:
                self.requires_setup = False

        elif move.is_play:
            self.board.move_ring(self.next_player, move.src_hex, move.dst_hex)
            self.next_player = self.next_player.other

    def complete_row(self, row: list[Hex]):
        self.board._complete_row(row)

    def remove_ring(self, hex: Hex):
        if self.board.rings[hex].value:
            self.players.white.rings += 1
        else:
            self.players.black.rings += 1
        self.board._remove_ring(hex)

    @property
    def legal_moves(self):
        return MoveGenerator(self)
