function testAll() {
  let assertion = true;

  pasteTestData("TestAll", "Input");
  userAddRecords();

  assertion = assertion && compareTestData("Database", getDatabaseRange(), "TestAll", "DatabaseOutput");

  clearAll();

  return assertion;
}
