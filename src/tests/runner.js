// Because GAS debugger hangs when QUnit is loaded, all tests are written without QUnit so they can be debugged
// Only this runner function loads QUnit to check if tests return true
// Search for "actual=false" in console log to find failing tests
function runAllTests() {
  QUnit.on("runEnd", (runEnd) => {
    Logger.log(JSON.stringify(runEnd, null, " "));
  });

  QUnit.log(Logger.log);

  QUnit.start();

  QUnit.module("Integration", (hooks) => {
    QUnit.test("testAll", (assert) => {
      assert.true(testAll());
    });

    QUnit.test("testOverage", (assert) => {
      assert.true(testOverage());
    });

    QUnit.test("testAddressChange", (assert) => {
      assert.true(testAddressChange());
    });

    QUnit.test("testUnduplicatedCategory", (assert) => {
      assert.true(testUnduplicatedCategory());
    });

    /* only run this when you need to to avoid hitting daily quota
    QUnit.test("testMaximumValidation", (assert) => {
      assert.true(testMaximumValidation());
    })*/
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

function testSetup() {
  const existingCityFundLimit = getCityFundPerQuarterRange().getValue();
  const existingCountyFundLimit = getCountyFundPerQuarterRange().getValue();

  SpreadsheetApp.flush();
  clearAll();
  setCurrencyFormat(getCityFundPerQuarterRange().setValue(50));
  setCurrencyFormat(getCountyFundPerQuarterRange().setValue(50));
  return { existingCityFundLimit, existingCountyFundLimit };
}

function testTeardown(existingCityFundLimit, existingCountyFundLimit) {
  SpreadsheetApp.flush();
  clearAll();
  setCurrencyFormat(getCityFundPerQuarterRange().setValue(existingCityFundLimit));
  setCurrencyFormat(getCountyFundPerQuarterRange().setValue(existingCountyFundLimit));
}

// Given an array of values, finds the one-based index of value which matches provided name
function findNameIndex(values, name) {
  return values.indexOf(name) + 1;
}

// Returns range on TESTS sheet from $(testName)$(dataName) to $(Last row with data or End+testName)$(End+dataName)
function loadTestDataRange(testName, dataName) {
  const testSheet = getTestSheet();
  const testNames = transpose(testSheet.getRange("A:A").getValues())[0];
  const dataNames = testSheet.getRange("1:1").getValues();
  const dataRowStart = findNameIndex(testNames, testName);
  const dataRowEnd = findNameIndex(testNames, `End${testName}`);
  const dataColStart = findNameIndex(dataNames[0], dataName);
  const dataColEnd = findNameIndex(dataNames[0], `End${dataName}`);

  // getNextDataCell will throw an exception if the column is hidden
  // see https://issuetracker.google.com/issues/171281549
  const lastRowWithData = testSheet
    .getRange(dataRowEnd + 1, dataColStart)
    /* did you unhide all columns on the TEST sheet? :) */ .getNextDataCell(SpreadsheetApp.Direction.UP)
    .getRow();

  const dataRange = testSheet.getRange(
    dataRowStart,
    dataColStart,
    lastRowWithData - dataRowStart + 1,
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

// Assumes both 2D ranges
// Returns 1-based indices, 0 if match
function compareRanges(actualRange, expectedRange) {
  let errorRowIndex = 0;
  let errorColIndex = 0;

  const actualRangeValues = actualRange.getValues();
  const expectedRangeValues = expectedRange.getValues();

  if (actualRange.getWidth() !== expectedRange.getWidth()) {
    Logger.log(`Actual width ${actualRange.getWidth()} does not match Expected width ${expectedRange.getWidth()}`);
    errorRowIndex = 1;
    errorColIndex = actualRange.getWidth();
  } else if (actualRange.getNumRows() !== expectedRange.getNumRows()) {
    Logger.log(
      `Actual height ${actualRange.getNumRows()} does not match Expected height ${expectedRange.getNumRows()}`,
    );
    errorRowIndex = expectedRangeValues.length + 1;
    errorColIndex = 1;
  } else {
    loopRow: for (let row = 0; row < expectedRangeValues.length; row++) {
      for (let col = 0; col < expectedRangeValues[0].length; col++) {
        if (typeof expectedRangeValues[row][col] === "object") {
          // convert date to string before comparing
          expectedRangeValues[row][col] = expectedRangeValues[row][col].toString();
          actualRangeValues[row][col] = actualRangeValues[row][col].toString();
        }
        if (actualRangeValues[row][col] !== expectedRangeValues[row][col]) {
          Logger.log(
            `Actual ${actualRangeValues[row][col]} - ${typeof actualRangeValues[row][col]} does not match Expected ${expectedRangeValues[row][col]} - ${typeof expectedRangeValues[row][col]}`,
          );
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

function runTest(testFn) {
  const { existingCityFundLimit, existingCountyFundLimit } = testSetup();

  const assertion = testFn();

  testTeardown(existingCityFundLimit, existingCountyFundLimit);
  return assertion;
}

function runBasicTest(testName) {
  return runTest(() => {
    let assertion = true;

    pasteTestData(testName, "Input");
    userAddRecords(true);

    assertion = assertion && compareAllExceptCityNonCityTotals(testName);

    return assertion;
  });
}
