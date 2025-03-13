import {
  endCharacter,
  ERROR_MESSAGE,
  startCharacter,
  turnCharacter,
} from "./constants";
import { maps } from "./maps";

enum Direction {
  Initial = "Initial",
  N = "N",
  W = "W",
  S = "S",
  E = "E",
}

interface Position {
  i: number;
  j: number;
  direction: Direction;
  value: string;
}

main(maps[Number(process.argv[2]) ?? 0] ?? maps[0]);

function main(initialMap: Array<Array<string>>) {
  const { err, data } = getInitialValues(initialMap);
  if (err) {
    console.error("Error:", err);
    return;
  }
  if (!data) return;

  const workingMap: Array<Array<Position>> = data.workingMap;

  const { err: nextStepError, path } = nextStep(
    initialMap,
    data.startPosition,
    data.startPosition,
    workingMap,
    [],
  );
  if (nextStepError) console.error("Error:", nextStepError);

  if (!path || path.length === 0) {
    console.error(ERROR_MESSAGE.defaultError);
    return;
  }

  let displayPath = startCharacter;

  path.forEach((e) => {
    displayPath += e.value;
  });

  const collectedLetters = displayPath.match(/[A-Z]/g)?.join("");

  console.log(`Path as characters: ${displayPath}`);
  console.log(`Collected letters: ${collectedLetters}`);
}

function getInitialValues(map: Array<Array<string>>): {
  err: string | null;
  data?: {
    startPosition: Position;
    workingMap: Array<Array<Position>>;
  };
} {
  const startPositions: Array<Position> = [];
  const endPositions: Array<Position> = [];
  const workingMap: Array<Array<Position>> = [];

  map.forEach((row, i) => {
    workingMap.push([]);
    row.forEach((value, j) => {
      workingMap[i].push({ i, j, direction: Direction.Initial, value });
      if (value === startCharacter) {
        startPositions.push({ i, j, direction: Direction.Initial, value });
      }
      if (value === endCharacter) {
        endPositions.push({ i, j, direction: Direction.Initial, value });
      }
    });
  });

  const { err } = validateMapConditions(startPositions, endPositions);
  if (err) return { err };

  return {
    err: null,
    data: {
      startPosition: startPositions[0],
      workingMap,
    },
  };
}

function nextStep(
  map: Array<Array<String>>,
  startPosition: Position,
  currentPosition: Position,
  workingMap: Array<Array<Position>>,
  path: Array<Position> = [],
): { err: string | null; path?: Array<Position> } {
  const { err, data: neighbours } = getValidNeighbours(
    currentPosition,
    workingMap,
  );
  if (err) {
    return { err };
  }

  if (!neighbours) return { err: ERROR_MESSAGE.defaultError };
  else if (neighbours.length === 0) {
    return { err: ERROR_MESSAGE.brokenPath };
  }

  const neighbour =
    neighbours.length === 1
      ? neighbours[0]
      : neighbours.find((a) => a.direction === currentPosition.direction);

  if (!!neighbour) {
    if (workingMap[neighbour.i][neighbour.j].direction === Direction.Initial) {
      path.push(workingMap[neighbour.i][neighbour.j]);
    }
    workingMap[neighbour.i][neighbour.j].direction = neighbour.direction;

    if (workingMap[neighbour.i][neighbour.j].value === endCharacter)
      return { err: null, path: path };

    const { err } = nextStep(
      map,
      startPosition,
      {
        i: neighbour.i,
        j: neighbour.j,
        direction: neighbour.direction,
        value: neighbour.value,
      },
      workingMap,
      path,
    );

    if (err) return { err };
    return { err: null, path };
  } else {
    return { err: ERROR_MESSAGE.defaultError };
  }
}

function validateMapConditions(
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

function getValidNeighbours(
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
    if (
      neighbours.filter(
        (e) =>
          e.direction != position.direction &&
          e.direction != oppositeDirection(position.direction),
      ).length === 0
    ) {
      return { err: ERROR_MESSAGE.fakeTurn };
    }
  }
  return { err: null, data: neighbours };
}

function getPossibleNeighbours(i: number, j: number): Array<Position> {
  return [
    { i, j: j - 1, direction: Direction.W, value: "" },
    { i, j: j + 1, direction: Direction.E, value: "" },
    { i: i - 1, j, direction: Direction.N, value: "" },
    { i: i + 1, j, direction: Direction.S, value: "" },
  ];
}

function isPossibleNeighbourInsideMap(
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

function oppositeDirection(direction: Direction) {
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
