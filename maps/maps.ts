import { ERROR_MESSAGE } from "../constants";
import { Direction } from "../Direction/direction";

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
