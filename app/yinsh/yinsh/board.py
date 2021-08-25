from __future__ import annotations

from app.yinsh.yinsh.helpers import straight_line, valid_hexes
from app.yinsh.yinsh.types import Direction, Hex, IllegalMoveError, Marker, Player, Ring


class Board:
    def __init__(self):
        self._grid: dict[Hex, Ring | Marker | None] = {}
        self.rings: dict[Hex, Ring] = {}
        self.markers: dict[Hex, Marker] = {}

    def place_ring(self, player: Player, hex: Hex):
        """Place a ring during setup of starting position"""
        if hex not in valid_hexes:
            raise IllegalMoveError(f"Hex must be valid board location: {hex}")

        if self._grid.get(hex) is not None:
            raise IllegalMoveError(f"Hex is not empty: {hex}")

        self._grid[hex] = Ring.WHITE if player.value else Ring.BLACK
        self.rings[hex] = Ring.WHITE if player.value else Ring.BLACK

        white_rings, black_rings = self._get_ring_count()
        if white_rings > 5 or black_rings > 5:
            del self._grid[hex]
            raise IllegalMoveError("Board would have too many rings")

    def is_valid_move(self, src_hex: Hex, dst_hex: Hex, silent: bool = True):
        """
        Determines if a move would be valid for the current board state\n
        If silent is False, exceptions will be raised instead of returning
        """
        if self.rings.get(src_hex) is None:
            if silent:
                return False
            raise IllegalMoveError(f"Source hex must contain ring: {src_hex}")

        # Hexes must be valid locations
        if not {src_hex, dst_hex} <= valid_hexes:
            if silent:
                return False
            raise IllegalMoveError(f"Hexes must be valid board locations: {src_hex}, {dst_hex}")

        # A ring must move
        if src_hex == dst_hex:
            if silent:
                return False
            raise IllegalMoveError("Ring must move to a new space")

        # A ring must always move to a vacant space
        if self._grid.get(dst_hex) is not None:
            if silent:
                return False
            raise IllegalMoveError(f"Destination hex is not empty: {dst_hex}")

        # A ring must always move in a straight line
        path = straight_line(src_hex, dst_hex)
        if path is None:
            if silent:
                return False
            raise IllegalMoveError("Ring must move in a straight line")

        for i, hex in enumerate(path[1:-1], start=2):
            hex_content = self._grid.get(hex)

            # A ring can only jump over markers, not over rings
            if isinstance(hex_content, Ring):
                if silent:
                    return False
                raise IllegalMoveError(f"Ring cannot pass another ring: {hex_content} at {hex}")

            # A ring must land in the first vacant space after passing one or more markers
            elif isinstance(hex_content, Marker) and i < len(path) - 1:
                if self._grid.get(path[i]) is None:
                    if silent:
                        return False
                    raise IllegalMoveError(
                        f"Ring cannot pass vacant spaces after passing markers: {hex}"
                    )

        return True

    def move_ring(self, player: Player, src_hex: Hex, dst_hex: Hex):
        """Move a ring from source to destination"""
        assert self.is_valid_move(src_hex, dst_hex, silent=False)
        if self.rings[src_hex].value != player.value:
            raise IllegalMoveError(f"Can't move opponent's ring: {src_hex}")

        self._grid[src_hex] = Marker.WHITE if player.value else Marker.BLACK
        self._grid[dst_hex] = Ring.WHITE if player.value else Ring.BLACK
        del self.rings[src_hex]
        self.rings[dst_hex] = Ring.WHITE if player.value else Ring.BLACK
        self.markers[src_hex] = Marker.WHITE if player.value else Marker.BLACK

        path = straight_line(src_hex, dst_hex)
        for hex in path[1:-1]:  # Slice to skip src and dst hexes
            hex_content = self._grid.get(hex)
            if hex in self.markers:
                self._grid[hex] = hex_content.other
                self.markers[hex] = hex_content.other

    def get_rows(self, player: Player):
        """Returns a list of completed rows on the board"""
        rows: list[list[Hex]] = []
        for hex, marker in self.markers.items():
            if marker.value != player.value:
                continue
            # Only 3 directions to prevent duplicate rows
            for direction in [Direction.N, Direction.NE, Direction.SE]:
                dir_hex = hex + direction.value.scale(4)
                if dir_hex in valid_hexes:
                    dir_marker = self.markers.get(dir_hex)
                    if dir_marker is None:
                        continue
                    elif dir_marker.value != marker.value:
                        continue

                    possible_row = straight_line(hex, dir_hex)
                    valid = True
                    for row_hex in possible_row[1:-1]:
                        row_marker = self.markers.get(row_hex)
                        if row_marker is None:
                            valid = False
                            break
                        elif row_marker.value != marker.value:
                            valid = False
                            break
                    if valid:
                        rows.append(possible_row)
        return rows

    def _get_ring_count(self):
        white_rings = 0
        black_rings = 0
        for _, ring in self.rings.items():
            if ring.value:
                white_rings += 1
            else:
                black_rings += 1
        return white_rings, black_rings

    def _complete_row(self, row: list[Hex]):
        for hex in row:
            del self._grid[hex]
            del self.markers[hex]

    def _remove_ring(self, hex: Hex):
        del self._grid[hex]
        del self.rings[hex]

    @classmethod
    def empty(cls):
        """Initializes a new empty YINSH board"""
        return Board()
