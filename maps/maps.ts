import { ERROR_MESSAGE, startCharacter, turnCharacter } from "../constants";
import { Direction, oppositeDirection } from "../direction/direction";

export interface Position {
  i: number;
  j: number;
  direction: Direction;
  value: string;
}

/**
 * Function that returns a path for display
 * @param path
 * @returns
 */
export function getDisplayPath(path: Array<Position>): string {
  let displayPath: string = startCharacter;

  path.forEach((e) => {
    displayPath += e.value;
  });

  return displayPath;
}

/**
 * Function that returns found letters but removes letters from the same location.
 * @param path
 * @returns
 */
export function getCollectedLetters(path: Array<Position>): string | undefined {
  const uniquePath = path.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.i === item.i && t.j === item.j),
  );

  let uniqueDisplayPath: string = startCharacter;
  uniquePath.forEach((e) => {
    uniqueDisplayPath += e.value;
  });

  return uniqueDisplayPath.match(/[A-Z]/g)?.join("");
}

/**
 * Validates map that following the requirements.
 * @param startPositions
 * @param endPositions
 * @returns Error message on error.
 */
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

/**
 * Function that returns valid neighbours.
 * @param position
 * @param workingMap
 * @returns Error or list of neighbours.
 */
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

/**
 * Function that generates possible neighbours locates Souther, Wester, Easter and Northern of position.
 * @param i
 * @param j
 * @returns List of possible positions.
 */
export function getPossibleNeighbours(i: number, j: number): Array<Position> {
  return [
    { i, j: j - 1, direction: Direction.W, value: "" },
    { i, j: j + 1, direction: Direction.E, value: "" },
    { i: i - 1, j, direction: Direction.N, value: "" },
    { i: i + 1, j, direction: Direction.S, value: "" },
  ];
}

/**
 * Function that validats is the position inside the map.
 * @param possiblePosition
 * @param workingMap
 * @returns true/false
 */
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

/**
 * Function that validates is position fake turn. Turn must change the direction.
 * @param neighbours
 * @param position
 * @returns true/false
 */
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
