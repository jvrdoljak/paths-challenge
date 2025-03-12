enum Directions {
  Initial = "Initial",
  N = "N",
  W = "W",
  S = "S",
  E = "E",
  Default = "Default",
}

interface Position {
  i: number;
  j: number;
  direction: Directions;
}

const validMap: Array<Array<String>> = [
  ["@", "-", "-", "-", "A", "-", "-", "-", "+"],
  ["", "", "", "", "", "", "", "", "|"],
  ["x", "-", "B", "-", "+", "", "", "", "C"],
  ["", "", "", "", "|", "", "", "", "|"],
  ["", "", "", "", "+", "-", "-", "-", "+"],
];

let nonEmptyIndexes: Array<Position> = [];
let path: string = "@";

function getInitialValues(
  map: Array<Array<String>>,
  cb: (
    err: string | null,
    data?: {
      nonEmptyIndexes: Array<Position>;
      startPosition: Position;
    },
  ) => void,
) {
  const nonEmptyIndexes: Array<Position> = [];
  const startPositions: Array<Position> = [];
  const endPositions: Array<Position> = [];

  map.forEach((row, i) => {
    row.forEach((value, j) => {
      if (value !== null && value !== "") {
        nonEmptyIndexes.push({ i, j, direction: Directions.Initial });
      }
      if (value == "@") {
        startPositions.push({ i, j, direction: Directions.Initial });
      }
      if (value == "x") {
        endPositions.push({ i, j, direction: Directions.Initial });
      }
    });
  });

  if (startPositions.length > 1) {
    cb("This map has two starting positions.");
    return;
  }
  if (endPositions.length > 1) {
    cb("This map has two end positions.");
    return;
  }
  if (startPositions[0] == null || endPositions[0] == null) {
    cb("Start or end position is missing");
    return;
  }

  cb(null, {
    nonEmptyIndexes,
    startPosition: startPositions[0],
  });
}

function oppositeDirection(direction: Directions) {
  switch (direction) {
    case Directions.N:
      return Directions.S;
    case Directions.E:
      return Directions.W;
    case Directions.S:
      return Directions.N;
    case Directions.W:
      return Directions.E;
    default:
      return Directions.Default;
  }
}

function getValidNeighbours(position: Position): Array<Position> {
  const { i, j } = position;
  const neighbourPositions = [
    { i: i + 1, j, direction: Directions.S },
    { i: i - 1, j, direction: Directions.N },
    { i, j: j + 1, direction: Directions.E },
    { i, j: j - 1, direction: Directions.W },
  ];
  const neighbours: Array<Position> = [];

  neighbourPositions.forEach((e) => {
    const findIndexResult = nonEmptyIndexes.findIndex((el) => {
      return (
        el.i == e.i &&
        el.j == e.j &&
        e.direction != oppositeDirection(el.direction)
      );
    });
    if (findIndexResult != -1) {
      nonEmptyIndexes[findIndexResult] = {
        ...nonEmptyIndexes[findIndexResult],
        direction: e.direction,
      };
      neighbours.push(e);
    }
  });

  return neighbours;
}

function nextStep(
  map: Array<Array<String>>,
  startPosition: Position,
  currentPosition: Position,
) {
  const neighbours = getValidNeighbours(currentPosition);
  let currentDirection: Directions;
  if (neighbours.length > 0 && neighbours.length < 2) {
    path += map[neighbours[0].i][neighbours[0].j];
    currentDirection = neighbours[0].direction;
    console.log({path});
    nextStep(map, startPosition, {
      i: neighbours[0].i,
      j: neighbours[0].j,
      direction: currentDirection,
    });
  }
}

getInitialValues(validMap, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  if (data == null) return;
  nonEmptyIndexes = data.nonEmptyIndexes;
  nextStep(validMap, data.startPosition, data.startPosition);
});

// getNeighbours(nEI, sP.i, sP.j);
