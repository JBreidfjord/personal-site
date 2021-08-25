from __future__ import annotations

from app.yinsh.yinsh.types import Direction, Hex


def distance(a: Hex, b: Hex):
    """Calculates the distance between two hexes"""
    return len(a - b)


def neighbour(hex: Hex, direction: Direction) -> Hex:
    """Returns the neighbour Hex in the given direction"""
    return hex + direction.value


def hex_round(hex: Hex):
    rq = round(hex.q)
    rr = round(hex.r)
    rs = round(hex.s)

    q_diff = abs(rq - hex.q)
    r_diff = abs(rr - hex.r)
    s_diff = abs(rs - hex.s)

    if q_diff > r_diff and q_diff > s_diff:
        rq = -rr - rs
    elif r_diff > s_diff:
        rr = -rq - rs
    else:
        rs = -rq - rr

    return Hex(rq, rr, rs)


def lerp(a: int | float, b: int | float, t: float):
    return round(a + (b - a) * t, 7)


def hex_lerp(a: Hex, b: Hex, t: float):
    return Hex(lerp(a.q, b.q, t), lerp(a.r, b.r, t), lerp(a.s, b.s, t))


def hex_linedraw(a: Hex, b: Hex):
    n = distance(a, b)
    if n == 0:
        return [a]
    results: list[Hex] = []
    for i in range(n + 1):
        results.append(hex_round(hex_lerp(a, b, (1.0 / n) * i)))
    return results


def straight_line(a: Hex, b: Hex):
    n = distance(a, b)
    for direction in Direction:
        scaled_hex = direction.value.scale(n)
        if a + scaled_hex == b:
            return hex_linedraw(a, b)


inv_coordinate_index: dict[int, Hex] = {}

inv_coordinate_index[0] = Hex(0, 0)
idx = 1
for q in range(-5, 6):
    for r in range(-5, 6):
        if -5 <= -q - r <= 5 and not ((abs(q) == 5 or q == 0) and (abs(r) == 5 or r == 0)):
            inv_coordinate_index[idx] = Hex(q, r)
            idx += 1

coordinate_index = {coord: i for i, coord in inv_coordinate_index.items()}
valid_hexes = set(coordinate_index.keys())
