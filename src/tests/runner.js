// Search for "failed" in console log to find failing tests
function runAllTests() {
  QUnit.on("runEnd", (runEnd) => {
    Logger.log(JSON.stringify(runEnd, null, " "));
  });

  QUnit.log(Logger.log);

  QUnit.start();

  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Home").getRange("A1").setValue("Hello World");

  QUnit.test("two numbers", (assert) => {
    assert.strictEqual(add(1, 2), 3);
  });
}
