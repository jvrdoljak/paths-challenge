import { Direction, oppositeDirection } from "./direction";

describe("oppositeDirection", () => {
  test.each([
    [Direction.N, Direction.S],
    [Direction.S, Direction.N],
    [Direction.E, Direction.W],
    [Direction.W, Direction.E],
  ])("should return opposite direction for %s", (input, expected) => {
    expect(oppositeDirection(input)).toBe(expected);
  });
});
