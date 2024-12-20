// Because GAS debugger hangs when QUnit is loaded, all tests are written without QUnit so they can be debugged
// Only this runner function loads QUnit to check if tests return true
// Search for "failed" in console log to find failing tests
function runAllTests() {
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
      getCityFundPerQuarterRange().setValue(1250);
      getCountyFundPerQuarterRange().setValue(2291.5);
    });

    QUnit.test("testPaste", (assert) => {
      assert.true(testPaste());
    });
  });
}

// Given an array of values, finds the one-based index of value which matches provided name
function findNameIndex(values, name) {
  return values.indexOf(name) + 1;
}

// Returns range on TESTS sheet from $(testName)$(dataName) to $(End+testName)$(End+dataName)
function loadTestData(testName, dataName) {
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
