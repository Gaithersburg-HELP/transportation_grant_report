function testAll() {
  const existingCityFundLimit = getCityFundPerQuarterRange().getValue();
  const existingCountyFundLimit = getCountyFundPerQuarterRange().getValue();
  setCurrencyFormat(getCityFundPerQuarterRange().setValue(50));
  setCurrencyFormat(getCountyFundPerQuarterRange().setValue(50));

  let assertion = true;

  // Test multiple runs of pasting and adding
  pasteTestData("TestAll", "Input", 4);
  userAddRecords();

  pasteTestData("TestAll", "Input", 24, 5);
  userAddRecords();

  assertion = assertion && compareTestData("Database", getDatabaseRange(), "TestAll", "DatabaseOutput");
  assertion =
    assertion && compareTestData("Calculated Fields", getCalculatedFieldsRange(), "TestAll", "CalculatedFieldsOutput");
  assertion = assertion && compareTestData("City Totals", getTotalRange(), "TestAll", "TotalsOutput");
  assertion = assertion && compareTestData("Address Listings", getAddressReportRange(), "TestAll", "AddressOutput");
  assertion =
    assertion && compareTestData("Non City Grant", getCountyReportAddressRange(), "TestAll", "NonCityGrantOutput");
  assertion =
    assertion &&
    compareTestData("Non City Grant Totals", getCountyReportTotalsRange(), "TestAll", "NonCityGrantTotalsOutput");

  clearAll();
  setCurrencyFormat(getCityFundPerQuarterRange().setValue(existingCityFundLimit));
  setCurrencyFormat(getCountyFundPerQuarterRange().setValue(existingCountyFundLimit));

  return assertion;
}

function testMaximumValidation() {
  // maximum number of rides/month is somewhere around 140, 140*12 = 1680 addresses
  // url fetchall maxes out at 2199: https://stackoverflow.com/questions/67580847/maximum-number-of-request-parameters-for-fetchall
  // Replace N Frederick with S Frederick to test response time on Gaithersburg servers with no caching

  // Timing results:
  // Adding records: 10 s (I think probably due to formatting)
  // Validation/categorization: 1 min 50 s for first attempt
  // Validation/categorization: 1 min 40 s for reattempt
  // Totals: 40 s

  const numRecords = 1700;
  const records = [];

  for (let x = 1; x <= numRecords; x++) {
    const record = [];
    // about 66% of records have units, about 33% don't
    // this matters for testing how much address reattempts slow down validation
    if (x % 3 === 0) {
      record[PASTE_FIELD_INDICES.Address - 1] = `${x} N Frederick Ave , Gaithersburg, MD`;
    } else {
      record[PASTE_FIELD_INDICES.Address - 1] = `${x} N Frederick Ave Ste 100, Gaithersburg, MD`;
    }

    record[PASTE_FIELD_INDICES.ApptDate - 1] = "03/03/2024";
    record[PASTE_FIELD_INDICES.ApptDest - 1] = "The Moon";
    record[PASTE_FIELD_INDICES.ApptTime - 1] = "3:00 AM";
    record[PASTE_FIELD_INDICES.Comments - 1] = "None";
    record[PASTE_FIELD_INDICES.Driver - 1] = "Spiderman";
    record[PASTE_FIELD_INDICES.LogDate - 1] = "03/02/2024";
    record[PASTE_FIELD_INDICES.Name - 1] = `Client ${x}`;
    record[PASTE_FIELD_INDICES.Notes - 1] = "n/a";
    record[PASTE_FIELD_INDICES.Phone - 1] = "111-222-3333";
    record[PASTE_FIELD_INDICES.Provided - 1] = "Taxi";
    record[PASTE_FIELD_INDICES.Return - 1] = 5;
    record[PASTE_FIELD_INDICES.Scheduler - 1] = "Batman";
    record[PASTE_FIELD_INDICES.Taxi - 1] = 5;
    record[PASTE_FIELD_INDICES.Total - 1] = 10;
    record[PASTE_FIELD_INDICES.Trip - 1] = "Round Trip";
    record[PASTE_FIELD_INDICES.Type - 1] = "Other";
    records.push(record);
  }

  getPasteRange().offset(0, 0, numRecords).setValues(records);
  getPasteRange().getCell(numRecords, PASTE_FIELD_INDICES.Address).setValue("31 S Summit Ave , Gaithersburg, MD");

  SpreadsheetApp.flush();
  userAddRecords();

  let assertion = true;
  // These assertions work for both N and S Frederick
  assertion = assertion && getDatabaseRange().getCell(101, DB_FIELD_INDICES.InCity).getValue() === "Yes";
  assertion = assertion && getDatabaseRange().getCell(421, DB_FIELD_INDICES.InCity).getValue() === "Yes";
  assertion = assertion && getDatabaseRange().getCell(800, DB_FIELD_INDICES.InCity).getValue() === "Yes";
  assertion = assertion && getDatabaseRange().getCell(numRecords, DB_FIELD_INDICES.InCity).getValue() === "Yes";

  clearAll();

  return assertion;
}
