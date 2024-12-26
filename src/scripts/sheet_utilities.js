function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map((row) => row[i]));
}

function getPasteSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Paste Here");
}

function getHomeSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FY Qtr Details");
}

function getAddressReportSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Address Listings");
}

function getCountyReportSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Non-City Grant Clients");
}

function getTestSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TESTS");
}

function getCityFundPerQuarterRange() {
  return getHomeSheet().getRange("C10");
}

function getCountyFundPerQuarterRange() {
  return getHomeSheet().getRange("C11");
}

function getPasteRange() {
  return getPasteSheet().getRange("A7:Q1000");
}

function getTotalRange() {
  return getHomeSheet().getRange("H2:K9");
}

function getCalculatedFieldsRange() {
  return getHomeSheet().getRange("T13:Z3000");
}

function getDatabaseRangeWithBlanks() {
  let dbNamedRange = null;

  getHomeSheet()
    .getNamedRanges()
    .forEach((namedRange) => {
      if (namedRange.getName() === "Database") {
        dbNamedRange = namedRange;
      }
    });
  return dbNamedRange.getRange();
}

// Returns first blank row if database is blank, otherwise returns database
function getDatabaseRange() {
  const dbRangeWithBlanks = getDatabaseRangeWithBlanks();

  const dbHeight = getHomeSheet().getLastRow() - dbRangeWithBlanks.getRow() + 1;

  if (dbHeight === 0) {
    return dbRangeWithBlanks.offset(0, 0, 1);
  }
  return dbRangeWithBlanks.offset(0, 0, dbHeight);
}

const DB_PROTECTION_DESC = "protect database";

function setProtection(rangeToProtect) {
  const rangeProtection = rangeToProtect.protect();
  rangeProtection.setDescription(DB_PROTECTION_DESC);
  rangeProtection.setWarningOnly(true);
}

function protectDatabase() {
  setProtection(getDatabaseRangeWithBlanks());
  setProtection(getCityFundPerQuarterRange());
  setProtection(getCountyFundPerQuarterRange());
}

function unprotectDatabase() {
  const protections = getHomeSheet().getProtections(SpreadsheetApp.ProtectionType.RANGE);
  protections.forEach((protection) => {
    if (protection.getDescription() === DB_PROTECTION_DESC) {
      protection.remove();
    }
  });
}

// 1-based rowIndex
function getRangeRow(range, rowIndex) {
  return range.offset(rowIndex - 1, 0, 1, range.getWidth());
}

// 1-based colIndex
function getRangeCol(range, colIndex) {
  return range.offset(0, colIndex - 1, range.getNumRows(), 1);
}

const DB_FIELD_INDICES = Object.freeze({
  InCity: 1,
  Category: 2,
  Name: 3,
  Phone: 4,
  Address: 5,
  Type: 6,
  ApptDate: 7,
  ApptTime: 8,
  ApptDest: 9,
  Provided: 10,
  Driver: 11,
  Scheduler: 12,
  LogDate: 13,
  Trip: 14,
  Comments: 15,
  Notes: 16,
  Taxi: 17,
  Return: 18,
  Total: 19,
});

function getAddressReportRange() {
  return getAddressReportSheet().getRange("A2:M3000");
}

function clearAll() {
  SpreadsheetApp.flush();
  getPasteRange().clearContent();
  getTotalRange().setValue(0);
  getDatabaseRange().clearContent();
  getAddressReportRange().clearContent();
  getCalculatedFieldsRange().clearContent();
}
