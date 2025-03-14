import { ERROR_MESSAGE, turnCharacter } from "../constants";
import { Direction } from "../direction/direction";
import {
  getValidNeighbours,
  isFakeTurn,
  isPossibleNeighbourInsideMap,
  Position,
  validateMapConditions,
} from "./maps";

describe("validateMapConditions", () => {
  test("should return error if there are multiple start positions", () => {
    const startPositions: Array<Position> = [
      { i: 0, j: 0, direction: Direction.Initial, value: "" },
      { i: 2, j: 3, direction: Direction.Initial, value: "" },
    ];
    const endPositions: Array<Position> = [
      { i: 4, j: 4, direction: Direction.Initial, value: "" },
    ];

    const result = validateMapConditions(startPositions, endPositions);
    expect(result.err).toBe(ERROR_MESSAGE.multipleStarts);
  });

  test("should return error if there are multiple end positions", () => {
    const startPositions: Array<Position> = [
      { i: 0, j: 0, direction: Direction.Initial, value: "" },
    ];
    const endPositions: Array<Position> = [
      { i: 4, j: 4, direction: Direction.Initial, value: "" },
      { i: 2, j: 2, direction: Direction.Initial, value: "" },
    ];

    const result = validateMapConditions(startPositions, endPositions);
    expect(result.err).toBe(ERROR_MESSAGE.multipleEnds);
  });

  test("should return error if there is no start position", () => {
    const startPositions: Array<Position> = [];
    const endPositions: Array<Position> = [
      { i: 4, j: 4, direction: Direction.Initial, value: "" },
    ];

    const result = validateMapConditions(startPositions, endPositions);
    expect(result.err).toBe(ERROR_MESSAGE.missingStart);
  });

  test("should return error if there is no end position", () => {
    const startPositions: Array<Position> = [
      { i: 0, j: 0, direction: Direction.Initial, value: "" },
    ];
    const endPositions: Array<Position> = [];

    const result = validateMapConditions(startPositions, endPositions);
    expect(result.err).toBe(ERROR_MESSAGE.missingEnd);
  });

  test("should return null if start and end positions are valid", () => {
    const startPositions: Array<Position> = [
      { i: 0, j: 0, direction: Direction.Initial, value: "" },
    ];
    const endPositions: Array<Position> = [
      { i: 4, j: 4, direction: Direction.Initial, value: "" },
    ];

    const result = validateMapConditions(startPositions, endPositions);
    expect(result.err).toBeNull();
  });
});

describe("isPossibleNeighbourInsideMap", () => {
  const mockMap: Array<Array<Position>> = [
    [
      { i: 0, j: 0, direction: Direction.N, value: "@" },
      { i: 0, j: 1, direction: Direction.E, value: "-" },
    ],
    [
      { i: 1, j: 0, direction: Direction.S, value: "x" },
      { i: 1, j: 1, direction: Direction.W, value: turnCharacter },
    ],
  ];

  test("should return true for a position inside the map", () => {
    const position: Position = {
      i: 1,
      j: 1,
      direction: Direction.W,
      value: "+",
    };
    expect(isPossibleNeighbourInsideMap(position, mockMap)).toBe(true);
  });

  test("should return false for a position with negative i index", () => {
    const position: Position = {
      i: -1,
      j: 1,
      direction: Direction.N,
      value: "-",
    };
    expect(isPossibleNeighbourInsideMap(position, mockMap)).toBe(false);
  });

  test("should return false for a position with negative j index", () => {
    const position: Position = {
      i: 1,
      j: -1,
      direction: Direction.S,
      value: "x",
    };
    expect(isPossibleNeighbourInsideMap(position, mockMap)).toBe(false);
  });

  test("should return false for a position outside the i boundary", () => {
    const position: Position = {
      i: 2,
      j: 1,
      direction: Direction.E,
      value: "-",
    };
    expect(isPossibleNeighbourInsideMap(position, mockMap)).toBe(false);
  });

  test("should return false for a position outside the j boundary", () => {
    const position: Position = {
      i: 1,
      j: 2,
      direction: Direction.W,
      value: "+",
    };
    expect(isPossibleNeighbourInsideMap(position, mockMap)).toBe(false);
  });
});

describe("isFakeTurn", () => {
  test("should return true when all neighbours have the same or opposite direction", () => {
    const position: Position = {
      i: 0,
      j: 4,
      direction: Direction.E,
      value: turnCharacter,
    };
    const neighbours: Array<Position> = [
      { i: 0, j: 5, direction: Direction.E, value: "-" },
    ];

    expect(isFakeTurn(neighbours, position)).toBe(true);
  });

  test("should return false when at least one neighbour has a different direction", () => {
    const position: Position = {
      i: 0,
      j: 1,
      direction: Direction.E,
      value: turnCharacter,
    };
    const neighbours: Array<Position> = [
      { i: 1, j: 1, direction: Direction.S, value: "|" },
    ];

    expect(isFakeTurn(neighbours, position)).toBe(false);
  });
});

describe("getValidNeighbours", () => {
  const mockMap: Array<Array<Position>> = [
    [
      { i: 0, j: 0, direction: Direction.Initial, value: "@" },
      { i: 0, j: 1, direction: Direction.Initial, value: "-" },
      { i: 0, j: 2, direction: Direction.Initial, value: turnCharacter },
    ],
    [
      { i: 1, j: 0, direction: Direction.Initial, value: "" },
      { i: 1, j: 1, direction: Direction.Initial, value: "" },
      { i: 1, j: 2, direction: Direction.Initial, value: "|" },
    ],
    [
      { i: 2, j: 0, direction: Direction.Initial, value: "x" },
      { i: 2, j: 1, direction: Direction.Initial, value: "-" },
      { i: 2, j: 2, direction: Direction.Initial, value: turnCharacter },
    ],
  ];

  test("should return valid neighbours for a normal position", () => {
    const position: Position = {
      i: 0,
      j: 0,
      direction: Direction.Initial,
      value: "@",
    };
    const result = getValidNeighbours(position, mockMap);

    expect(result.err).toBeNull();
    expect(result.data).toEqual([{ ...mockMap[0][1], direction: Direction.E }]);
  });

  test("should return an error if position is a fake turn", () => {
    const position: Position = {
      i: 0,
      j: 4,
      direction: Direction.E,
      value: turnCharacter,
    };
    const fakeTurnMap: Array<Array<Position>> = [
      [
        { i: 0, j: 0, direction: Direction.E, value: "@" },
        { i: 0, j: 1, direction: Direction.E, value: "-" },
        { i: 0, j: 2, direction: Direction.E, value: "A" },
        { i: 0, j: 3, direction: Direction.E, value: "-" },
        { i: 0, j: 4, direction: Direction.E, value: turnCharacter },
        { i: 0, j: 5, direction: Direction.Initial, value: "-" },
        { i: 0, j: 6, direction: Direction.Initial, value: "B" },
        { i: 0, j: 7, direction: Direction.Initial, value: "-" },
        { i: 0, j: 8, direction: Direction.Initial, value: "x" },
      ],
    ];
    const result = getValidNeighbours(position, fakeTurnMap);

    expect(result.err).toBe(ERROR_MESSAGE.fakeTurn);
  });

  test("should return no neighbours if all are out of bounds", () => {
    const position: Position = {
      i: 10,
      j: 10,
      direction: Direction.Initial,
      value: "-",
    };
    const result = getValidNeighbours(position, mockMap);

    expect(result.err).toBeNull();
    expect(result.data).toEqual([]);
  });
});
