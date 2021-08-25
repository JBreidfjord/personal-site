from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Hex:
    def __init__(self, q: float, r: float, s: float = None):
        """Data structure representing a hex coordinate using a cube/axial system"""
        self.s = s if s is not None else -q - r
        if q + r + self.s > 1e-7:
            raise ValueError("Coordinates must sum to 0")
        self.q = q
        self.r = r
        self.cube = (self.q, self.r, self.s)
        self.axial = (self.q, self.r)

        self._neighbours: list[Hex] = []

    def neighbours(self):
        from yinsh.helpers import Direction, neighbour, valid_hexes

        if self._neighbours == []:
            for direction in Direction:
                possible_neighbour = neighbour(self, direction)
                if possible_neighbour in valid_hexes:
                    self._neighbours.append(possible_neighbour)
        return self._neighbours

    def __repr__(self):
        return f"Hex{self.axial}"

    def __eq__(self, other: Hex):
        return self.cube == other.cube

    def __hash__(self):
        return hash(self.axial)

    def __add__(self, other: Hex):
        if not isinstance(other, Hex):
            raise TypeError(f"Invalid type {type(other)}")
        return Hex(self.q + other.q, self.r + other.r)

    def __sub__(self, other: Hex):
        if not isinstance(other, Hex):
            raise TypeError(f"Invalid type {type(other)}")
        return Hex(self.q - other.q, self.r - other.r)

    def __len__(self):
        return int((abs(self.q) + abs(self.r) + abs(self.s)) / 2)

    def __lt__(self, other: Hex):
        if not isinstance(other, Hex):
            raise TypeError(f"Invalid type {type(other)}")
        return len(self) < len(other)

    def __le__(self, other: Hex):
        if not isinstance(other, Hex):
            raise TypeError(f"Invalid type {type(other)}")
        return len(self) <= len(other)

    def __gt__(self, other: Hex):
        if not isinstance(other, Hex):
            raise TypeError(f"Invalid type {type(other)}")
        return len(self) > len(other)

    def __ge__(self, other: Hex):
        if not isinstance(other, Hex):
            raise TypeError(f"Invalid type {type(other)}")
        return len(self) >= len(other)

    def scale(self, k: int):
        """Scale Hex by factor k"""
        return Hex(self.q * k, self.r * k)


class Player(Enum):
    WHITE = True
    BLACK = False

    @property
    def other(self):
        return Player.BLACK if self.value else Player.WHITE

    def set_rings(self, num_rings: int):
        self.rings = num_rings


@dataclass
class Players:
    white = Player.WHITE
    black = Player.BLACK


class Ring(Enum):
    WHITE = True
    BLACK = False

    @property
    def other(self):
        return Ring.BLACK if self.value else Ring.WHITE

    def __str__(self):
        return "\u25CE" if self.value else "\u229A"


class Marker(Enum):
    WHITE = True
    BLACK = False

    @property
    def other(self):
        return Marker.BLACK if self.value else Marker.WHITE

    def __str__(self):
        return "\u25C8" if self.value else "\u25C7"


class Direction(Enum):
    N = Hex(0, -1)
    NE = Hex(1, -1)
    SE = Hex(1, 0)
    S = Hex(0, 1)
    SW = Hex(-1, 1)
    NW = Hex(-1, 0)


class IllegalMoveError(Exception):
    ...


@dataclass
class Outcome:
    winner: Player
