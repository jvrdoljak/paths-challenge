enum Directions {
  Initial = "Initial",
  N = "N",
  W = "W",
  S = "S",
  E = "E",
}

interface Position {
  i: number;
  j: number;
  direction: Directions;
  value: string;
}

const initialMap: Array<Array<string>> = [
  ["@", "-", "-", "-", "A", "-", "-", "-", "+"],
  ["", "", "", "", "", "", "", "", "|"],
  ["x", "-", "B", "-", "+", "", "", "", "C"],
  ["", "", "", "", "|", "", "", "", "|"],
  ["", "", "", "", "+", "-", "-", "-", "+"],
];

let workingMap: Array<Array<Position>> = [];
let path: string = "@";

function getInitialValues(
  map: Array<Array<string>>,
  cb: (
    err: string | null,
    data?: {
      startPosition: Position;
    },
  ) => void,
) {
  const startPositions: Array<Position> = [];
  const endPositions: Array<Position> = [];

  map.forEach((row, i) => {
    workingMap.push([]);
    row.forEach((value, j) => {
      workingMap[i].push({ i, j, direction: Directions.Initial, value });
      if (value == "@") {
        startPositions.push({ i, j, direction: Directions.Initial, value });
      }
      if (value == "x") {
        endPositions.push({ i, j, direction: Directions.Initial, value });
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
      return direction;
  }
}

function getValidNeighbours(position: Position): Array<Position> {
  const neighbours: Array<Position> = [];
  const { i: currentI, j: currentJ, direction: currentDirection } = position;
  const possibleNeighbourPositions = [
    { i: currentI, j: currentJ - 1, direction: Directions.W },
    { i: currentI, j: currentJ + 1, direction: Directions.E },
    { i: currentI - 1, j: currentJ, direction: Directions.N },
    { i: currentI + 1, j: currentJ, direction: Directions.S },
  ];
  possibleNeighbourPositions.forEach((possiblePosition) => {
    console.log({possiblePosition})
    if (
      (possiblePosition.i >= 0) &&
      (possiblePosition.i < workingMap.length) &&
      (possiblePosition.j >= 0) &&
      (possiblePosition.j < workingMap[possiblePosition.i].length)
    ) {
      if (
        workingMap[possiblePosition.i][possiblePosition.j].value != "" &&
        possiblePosition.direction !=
          oppositeDirection(workingMap[currentI][currentJ].direction)
      ) {
        neighbours.push({...workingMap[possiblePosition.i][possiblePosition.j], direction: possiblePosition.direction});
      }
    }
  });
  console.log({position})
 console.log({neighbours});
  return neighbours;
}

function nextStep(
  map: Array<Array<String>>,
  startPosition: Position,
  currentPosition: Position,
) {
  const neighbours = getValidNeighbours(currentPosition);

  if (neighbours.length > 0 && neighbours.length < 2) {
    path += workingMap[neighbours[0].i][neighbours[0].j].value;
    workingMap[neighbours[0].i][neighbours[0].j].direction = neighbours[0].direction;

    if(workingMap[neighbours[0].i][neighbours[0].j].value == 'x') return;

      nextStep(map, startPosition, {
        i: neighbours[0].i,
        j: neighbours[0].j,
        direction: neighbours[0].direction,
        value: neighbours[0].value,
      });
  }
}

getInitialValues(initialMap, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  if (data == null) return;
  nextStep(initialMap, data.startPosition, data.startPosition);
});

// getNeighbours(nEI, sP.i, sP.j);
