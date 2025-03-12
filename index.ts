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

const maps = [
  [
    ["@", "-", "-", "-", "A", "-", "-", "-", "+"],
    ["", "", "", "", "", "", "", "", "|"],
    ["x", "-", "B", "-", "+", "", "", "", "C"],
    ["", "", "", "", "|", "", "", "", "|"],
    ["", "", "", "", "+", "-", "-", "-", "+"],
  ],
  [
    ["@", "", "", "", "", "", "", "", "", ""],
    ["|", "", "+", "-", "C", "-", "-", "+", "", ""],
    ["A", "", "|", "", "", "", "", "|", "", ""],
    ["+", "-", "-", "-", "B", "-", "-", "+", "", ""],
    ["", "", "|", "", "", "", "", "", "", "x"],
    ["", "", "|", "", "", "", "", "", "", "|"],
    ["", "", "+", "-", "-", "-", "D", "-", "-", "+"],
  ],
  [
    ["@", "-", "-", "-", "A", "-", "-", "-", "+"],
    ["", "", "", "", "", "", "", "", "|"],
    ["x", "-", "B", "-", "+", "", "", "", "|"],
    ["", "", "", "", "|", "", "", "", "|"],
    ["", "", "", "", "+", "-", "-", "-", "C"],
  ],
  [
    ["", "", "", "", "+", "-", "O", "-", "N", "-", "+", "", ""],
    ["", "", "", "", "|", "", "", "", "", "", "|", "", ""],
    ["", "", "", "", "|", "", "", "", "+", "-", "I", "-", "+"],
    ["@", "-", "G", "-", "O", "-", "+", "", "|", "", "|", "", "|"],
    ["", "", "", "", "|", "", "|", "", "+", "-", "+", "", "E"],
    ["", "", "", "", "+", "-", "+", "", "", "", "", "", "S"],
    ["", "", "", "", "", "", "", "", "", "", "", "", "|"],
    ["", "", "", "", "", "", "", "", "", "", "", "", "x"],
  ],
  [
    ["@", "-", "-", "A", "-", "+", "", ""],
    ["", "", "", "", "", "|", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "B", "-", "x"],
  ],
];

let initialMap = maps[Number(process.argv[2]) ?? 0] ?? maps[0];
let workingMap: Array<Array<Position>> = [];
let path: Array<Position> = [];

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
    cb("Multiple starts.");
    return;
  }
  if (endPositions.length > 1) {
    cb("Multiple ends.");
    return;
  }
  if (startPositions.length < 1) {
    cb("Missing start character.");
    return;
  }
  if (endPositions.length < 1) {
    cb("Missing end character.");
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

function getValidNeighbours(
  position: Position,
  cb: (err: string | null, data?: Array<Position>) => void,
) {
  const neighbours: Array<Position> = [];
  const { i: currentI, j: currentJ, direction: currentDirection } = position;
  const possibleNeighbourPositions = [
    { i: currentI, j: currentJ - 1, direction: Directions.W },
    { i: currentI, j: currentJ + 1, direction: Directions.E },
    { i: currentI - 1, j: currentJ, direction: Directions.N },
    { i: currentI + 1, j: currentJ, direction: Directions.S },
  ];
  possibleNeighbourPositions.forEach((possiblePosition) => {
    if (
      possiblePosition.i >= 0 &&
      possiblePosition.i < workingMap.length &&
      possiblePosition.j >= 0 &&
      possiblePosition.j < workingMap[possiblePosition.i].length
    ) {
      if (
        workingMap[possiblePosition.i][possiblePosition.j].value != "" &&
        possiblePosition.direction !=
          oppositeDirection(workingMap[currentI][currentJ].direction)
      ) {
        neighbours.push({
          ...workingMap[possiblePosition.i][possiblePosition.j],
          direction: possiblePosition.direction,
        });
      }
    }
  });

  if (neighbours.length != 0 && position.value == "+") {
    if (
      neighbours.filter(
        (e) =>
          e.direction != position.direction &&
          e.direction != oppositeDirection(position.direction),
      ).length == 0
    ) {
      cb("Fake turn.");
      return;
    }
  }
  cb(null, neighbours);
}

function nextStep(
  map: Array<Array<String>>,
  startPosition: Position,
  currentPosition: Position,
  cb: (err?: string) => void,
) {
  let neighbours: Array<Position> | undefined;
  getValidNeighbours(currentPosition, (err, data) => {
    if (err) {
      console.error("Error: ", err);
      return;
    }

    neighbours = data;
  });

  if (!neighbours) return;

  if (neighbours.length == 0) cb("Broken path.");

  const neighbour =
    neighbours.length == 1
      ? neighbours[0]
      : neighbours.find((a) => a.direction == currentPosition.direction);

  if (!!neighbour) {
    if (workingMap[neighbour.i][neighbour.j].direction == Directions.Initial) {
      path.push(workingMap[neighbour.i][neighbour.j]);
    }
    workingMap[neighbour.i][neighbour.j].direction = neighbour.direction;

    if (workingMap[neighbour.i][neighbour.j].value == "x") return;

    nextStep(
      map,
      startPosition,
      {
        i: neighbour.i,
        j: neighbour.j,
        direction: neighbour.direction,
        value: neighbour.value,
      },
      (err) => {
        if (err) console.error("Error:", err);
      },
    );
  } else {
    cb("Error");
  }
}

getInitialValues(initialMap, (err, data) => {
  if (err) {
    console.error("Error:", err);
    return;
  }

  if (data == null) return;

  nextStep(initialMap, data.startPosition, data.startPosition, (err) => {
    if (err) console.error("Error:", err);
  });

  let displayPath = "@";

  path.forEach((e) => {
    displayPath += e.value;
  });

  const displayWord = displayPath.match(/[A-Z]/g)?.join("");

  console.log({ displayPath });
  console.log({ displayWord });
});
