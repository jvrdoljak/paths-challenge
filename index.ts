import { endCharacter, ERROR_MESSAGE, startCharacter } from "./constants";
import { Direction } from "./direction/direction";
import {
  getCollectedLetters,
  getDisplayPath,
  getValidNeighbours,
  Position,
  validateMapConditions,
} from "./maps/maps";
import { maps } from "./maps/mapsData";

main(maps[Number(process.argv[2]) ?? 0] ?? maps[0]);

/**
 * Root function that calls the project and logs characters if success or error message on error.
 * @param initialMap
 */
export function main(initialMap: Array<Array<string>>) {
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
  if (nextStepError) {
    console.error("Error:", nextStepError);
    return;
  }

  if (!path || path.length === 0) {
    console.error(ERROR_MESSAGE.defaultError);
    return;
  }

  const displayPath = getDisplayPath(path);
  const collectedLetters = getCollectedLetters(path);

  console.log(`Path as characters: ${displayPath}`);
  if (collectedLetters) console.log(`Collected letters: ${collectedLetters}`);
}

/**
 * Function that uses two dimensional array, address each position and returns addressed working map.
 * @param map
 * @returns Error message or start position with addressed map.
 */
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

/**
 * Recursion that is walking through the two dimensional array and returns path made of characters.
 * @param map
 * @param startPosition
 * @param currentPosition
 * @param workingMap
 * @param path
 * @returns Error message or full path.
 */
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

  if (!neighbour) return { err: ERROR_MESSAGE.defaultError };

  path.push(workingMap[neighbour.i][neighbour.j]);
  workingMap[neighbour.i][neighbour.j].direction = neighbour.direction;

  if (workingMap[neighbour.i][neighbour.j].value === endCharacter)
    return { err: null, path: path };

  const { err: nextStepError } = nextStep(
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

  if (nextStepError) return { err: nextStepError };

  return { err: null, path };
}
