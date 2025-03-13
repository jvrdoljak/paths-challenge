export enum Direction {
  Initial = "Initial",
  N = "N",
  W = "W",
  S = "S",
  E = "E",
}
export function oppositeDirection(direction: Direction) {
  switch (direction) {
    case Direction.N:
      return Direction.S;
    case Direction.E:
      return Direction.W;
    case Direction.S:
      return Direction.N;
    case Direction.W:
      return Direction.E;
    default:
      return direction;
  }
}
