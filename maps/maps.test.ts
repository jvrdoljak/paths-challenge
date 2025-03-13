import { ERROR_MESSAGE } from "../constants";
import { Direction } from "../Direction/direction";
import { Position, validateMapConditions } from "./maps";

describe("validateMapConditions", () => {
  test("should return error if there are multiple start positions", () => {
    const startPositions: Position[] = [
      { i: 0, j: 0, direction: Direction.Initial, value: '' },
      { i: 2, j: 3, direction: Direction.Initial, value: '' },
    ];
    const endPositions: Position[] = [{ i: 4, j: 4, direction: Direction.Initial, value: '' }];

    const result = validateMapConditions(startPositions, endPositions);
    expect(result.err).toBe(ERROR_MESSAGE.multipleStarts);
  });

  test("should return error if there are multiple end positions", () => {
    const startPositions: Position[] = [{ i: 0, j: 0, direction: Direction.Initial, value: '' }];
    const endPositions: Position[] = [
      { i: 4, j: 4, direction: Direction.Initial, value: '' },
      { i: 2, j: 2, direction: Direction.Initial, value: '' },
    ];

    const result = validateMapConditions(startPositions, endPositions);
    expect(result.err).toBe(ERROR_MESSAGE.multipleEnds);
  });

  test("should return error if there is no start position", () => {
    const startPositions: Position[] = [];
    const endPositions: Position[] = [{ i: 4, j: 4, direction: Direction.Initial, value: '' }];

    const result = validateMapConditions(startPositions, endPositions);
    expect(result.err).toBe(ERROR_MESSAGE.missingStart);
  });

  test("should return error if there is no end position", () => {
    const startPositions: Position[] = [{ i: 0, j: 0, direction: Direction.Initial, value: '' }];
    const endPositions: Position[] = [];

    const result = validateMapConditions(startPositions, endPositions);
    expect(result.err).toBe(ERROR_MESSAGE.missingEnd);
  });

  test("should return null if start and end positions are valid", () => {
    const startPositions: Position[] = [{ i: 0, j: 0, direction: Direction.Initial, value: '' }];
    const endPositions: Position[] = [{ i: 4, j: 4, direction: Direction.Initial, value: '' }];

    const result = validateMapConditions(startPositions, endPositions);
    expect(result.err).toBeNull();
  });
});
