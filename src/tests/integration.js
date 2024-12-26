function testAll() {
  let assertion = true;

  // Test multiple runs of pasting and adding
  pasteTestData("TestAll", "Input", 4);
  userAddRecords();

  pasteTestData("TestAll", "Input", 24, 5);
  userAddRecords();

  assertion = assertion && compareTestData("Database", getDatabaseRange(), "TestAll", "DatabaseOutput");

  clearAll();

  return assertion;
}
