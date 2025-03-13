import { main } from ".";

describe("main function", () => {
  test("should log correct path and collected letters", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const testMap = [
      ["@", "-", "-", "-", "A", "-", "-", "-", "+"],
      ["", "", "", "", "", "", "", "", "|"],
      ["x", "-", "B", "-", "+", "", "", "", "C"],
      ["", "", "", "", "|", "", "", "", "|"],
      ["", "", "", "", "+", "-", "-", "-", "+"],
    ];

    main(testMap);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Path as characters: @---A---+|C|+---+|+-B-x",
    );
    expect(consoleSpy).toHaveBeenCalledWith("Collected letters: ACB");

    consoleSpy.mockRestore();
  });
});
