import { ERROR_MESSAGE, turnCharacter } from "../constants";
import { Direction, oppositeDirection } from "../direction/direction";

export interface Position {
  i: number;
  j: number;
  direction: Direction;
  value: string;
}

export function validateMapConditions(
  startPositions: Array<Position>,
  endPositions: Array<Position>,
): { err: string | null } {
  if (startPositions.length > 1) {
    return { err: ERROR_MESSAGE.multipleStarts };
  }
  if (endPositions.length > 1) {
    return { err: ERROR_MESSAGE.multipleEnds };
  }
  if (startPositions.length < 1) {
    return { err: ERROR_MESSAGE.missingStart };
  }
  if (endPositions.length < 1) {
    return { err: ERROR_MESSAGE.missingEnd };
  }

  return { err: null };
}

export function getPossibleNeighbours(i: number, j: number): Array<Position> {
  return [
    { i, j: j - 1, direction: Direction.W, value: "" },
    { i, j: j + 1, direction: Direction.E, value: "" },
    { i: i - 1, j, direction: Direction.N, value: "" },
    { i: i + 1, j, direction: Direction.S, value: "" },
  ];
}

export function isPossibleNeighbourInsideMap(
  possiblePosition: Position,
  workingMap: Array<Array<Position>>,
): boolean {
  return (
    possiblePosition.i >= 0 &&
    possiblePosition.i < workingMap.length &&
    possiblePosition.j >= 0 &&
    possiblePosition.j < workingMap[possiblePosition.i].length
  );
}

export function getValidNeighbours(
  position: Position,
  workingMap: Array<Array<Position>>,
): {
  err: string | null;
  data?: Array<Position>;
} {
  const neighbours: Array<Position> = [];
  const { i: currentI, j: currentJ } = position;
  const possibleNeighbours: Array<Position> = getPossibleNeighbours(
    currentI,
    currentJ,
  );
  possibleNeighbours.forEach((possibleNeighbour) => {
    if (isPossibleNeighbourInsideMap(possibleNeighbour, workingMap)) {
      if (
        workingMap[possibleNeighbour.i][possibleNeighbour.j].value != "" &&
        possibleNeighbour.direction !=
          oppositeDirection(workingMap[currentI][currentJ].direction)
      ) {
        neighbours.push({
          ...workingMap[possibleNeighbour.i][possibleNeighbour.j],
          direction: possibleNeighbour.direction,
        });
      }
    }
  });
  if (neighbours.length != 0 && position.value === turnCharacter) {
    if (isFakeTurn(neighbours, position)) {
      return { err: ERROR_MESSAGE.fakeTurn };
    }
  }
  return { err: null, data: neighbours };
}

export function isFakeTurn(
  neighbours: Array<Position>,
  position: Position,
): boolean {
  return (
    neighbours.filter(
      (e) =>
        e.direction != position.direction &&
        e.direction != oppositeDirection(position.direction),
    ).length === 0
  );
}
