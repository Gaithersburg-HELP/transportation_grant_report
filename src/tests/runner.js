// Because GAS debugger hangs when QUnit is loaded, all tests are written without QUnit so they can be debugged
// Only this runner function loads QUnit to check if tests return true
// Search for "failed" in console log to find failing tests
function runAllTests() {
  const existingCityFundLimit = getCityFundPerQuarterRange().getValue();
  const existingCountyFundLimit = getCountyFundPerQuarterRange().getValue();

  QUnit.on("runEnd", (runEnd) => {
    Logger.log(JSON.stringify(runEnd, null, " "));
  });

  QUnit.log(Logger.log);

  QUnit.start();

  QUnit.module("Integration", (hooks) => {
    hooks.beforeEach(() => {
      SpreadsheetApp.flush();
      clearAll();
      getCityFundPerQuarterRange().setValue(50);
      getCountyFundPerQuarterRange().setValue(50);
    });

    hooks.afterEach(() => {
      SpreadsheetApp.flush();
      clearAll();
      getCityFundPerQuarterRange().setValue(existingCityFundLimit);
      getCountyFundPerQuarterRange().setValue(existingCountyFundLimit);
    });

    QUnit.test("testAll", (assert) => {
      assert.true(testAll());
    });
  });

  QUnit.module("Unit", (hooks) => {
    QUnit.test("testAddressPrefixPostfix", (assert) => {
      assert.true(testAddressPrefixPostfix());
    });
    QUnit.test("testQuarter", (assert) => {
      assert.true(testQuarter());
    });
    QUnit.test("testInitials", (assert) => {
      assert.true(testInitials());
    });
  });
}

// Given an array of values, finds the one-based index of value which matches provided name
function findNameIndex(values, name) {
  return values.indexOf(name) + 1;
}

// Returns range on TESTS sheet from $(testName)$(dataName) to $(End+testName)$(End+dataName)
function loadTestDataRange(testName, dataName) {
  const testSheet = getTestSheet();
  const testNames = transpose(testSheet.getRange("A:A").getValues())[0];
  const dataNames = testSheet.getRange("1:1").getValues();
  const dataRowStart = findNameIndex(testNames, testName);
  const dataRowEnd = findNameIndex(testNames, `End${testName}`);
  const dataColStart = findNameIndex(dataNames[0], dataName);
  const dataColEnd = findNameIndex(dataNames[0], `End${dataName}`);

  const dataRange = testSheet.getRange(
    dataRowStart,
    dataColStart,
    dataRowEnd - dataRowStart + 1,
    dataColEnd - dataColStart + 1,
  );
  return dataRange;
}

// Copies specified number of rows of test data from TESTS into paste range
// Copies all rows by default
// rowStart is 1-based
function pasteTestData(testName, dataName, rows = 0, rowStart = 1) {
  let testDataRng = loadTestDataRange(testName, dataName);
  if (rows > 0) {
    testDataRng = testDataRng.offset(rowStart - 1, 0, rows);
  }
  testDataRng.copyTo(getPasteRange().getCell(1, 1), { contentsOnly: true });
}

// Assumes both 2D ranges, drops blank rows at end of actualRange
// Returns 1-based indices, 0 if match
function compareRanges(actualRange, expectedRange) {
  let errorRowIndex = 0;
  let errorColIndex = 0;

  const actualRangeValues = actualRange.getValues();
  const expectedRangeValues = expectedRange.getValues();

  if (actualRange.getWidth() !== expectedRange.getWidth()) {
    errorRowIndex = 1;
    errorColIndex = actualRange.getWidth();
  } else if (actualRange.getSheet().getLastRow() - actualRange.getRow() + 1 !== expectedRange.getNumRows()) {
    errorRowIndex = expectedRangeValues.length + 1;
    errorColIndex = 1;
  } else {
    loopRow: for (let row = 0; row < expectedRangeValues.length; row++) {
      for (let col = 0; col < expectedRangeValues[0].length; col++) {
        if (typeof expectedRangeValues[row][col] === "object") {
          // convert date to number before comparing
          expectedRangeValues[row][col] = expectedRangeValues[row][col].valueOf();
          actualRangeValues[row][col] = actualRangeValues[row][col].valueOf();
        }
        if (actualRangeValues[row][col] !== expectedRangeValues[row][col]) {
          Logger.log(`Actual ${actualRangeValues[row][col]} does not match Expected ${expectedRangeValues[row][col]}`);
          errorRowIndex = row + 1;
          errorColIndex = col + 1;
          break loopRow;
        }
      }
    }
  }

  return { errorRowIndex, errorColIndex };
}

// from https://stackoverflow.com/a/21231012/13342792
function columnToLetter(column) {
  let currentColumnToConvert = column;
  let temp,
    letter = "";
  while (currentColumnToConvert > 0) {
    temp = (currentColumnToConvert - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    currentColumnToConvert = (currentColumnToConvert - temp - 1) / 26;
  }
  return letter;
}

function compareTestData(actualRangeName, rangeToCompare, testName, dataName) {
  const testDataRng = loadTestDataRange(testName, dataName);

  const { errorRowIndex, errorColIndex } = compareRanges(rangeToCompare, testDataRng);

  if (errorRowIndex === 0 && errorColIndex === 0) {
    return true;
  }
  Logger.log(
    `${actualRangeName} range does not match expected range: ${testName},${dataName} at ${testDataRng.getRow() + errorRowIndex - 1},${columnToLetter(testDataRng.getColumn() + errorColIndex - 1)}`,
  );
  return false;
}
