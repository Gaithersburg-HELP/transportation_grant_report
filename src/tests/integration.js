function testAll() {
  const assertion = true;

  pasteTestData("TestAll", "Input");
  userAddRecords();

  compareTestData("Database", getDatabaseRange(), "TestAll", "DatabaseOutput");

  clearAll();

  return assertion;
}
