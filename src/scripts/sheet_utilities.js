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

function getTestSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TESTS");
}

function getCityFundPerQuarterRange() {
  return getHomeSheet().getRange("C10");
}

function getCountyFundPerQuarterRange() {
  return getHomeSheet().getRange("C11");
}

function getTotalRange() {
  return getHomeSheet().getRange("H2:K9");
}

function getTotalCurrencyRange() {
  return getHomeSheet().getRange("H2:K3");
}

function removeBlanks(range) {
  const rangeHeight = range.getSheet().getLastRow() - range.getRow() + 1;

  if (rangeHeight === 0) {
    return range.offset(0, 0, 1);
  }
  return range.offset(0, 0, rangeHeight);
}

function getCalculatedFieldsRange() {
  return removeBlanks(getHomeSheet().getRange("T13:Z3000"));
}

function getAddressReportRange() {
  return removeBlanks(getAddressReportSheet().getRange("A2:M3000"));
}

function getCountyReportAddressRange() {
  return removeBlanks(
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Non-City Grant Clients").getRange("A4:R3000"),
  );
}

function getCountyReportTotalsRange() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Non-City Grant Clients").getRange("A2:N2");
}

// Returns first blank row if range is blank, otherwise returns all pasted rows with data only
function getPasteRange() {
  return removeBlanks(getPasteSheet().getRange("A26:Q2000"));
}

function getDatabaseRangeWithBlanks(rangeName) {
  let dbNamedRange = null;

  getHomeSheet()
    .getNamedRanges()
    .forEach((namedRange) => {
      if (namedRange.getName() === rangeName) {
        dbNamedRange = namedRange;
      }
    });
  return dbNamedRange.getRange();
}

// Returns first blank row if database is blank, otherwise returns database rows with data only
function getDatabaseRange(rangeName = "Database") {
  return removeBlanks(getDatabaseRangeWithBlanks(rangeName));
}

const DB_PROTECTION_DESC = "protect database";

function setProtection(rangeToProtect) {
  const rangeProtection = rangeToProtect.protect();
  rangeProtection.setDescription(DB_PROTECTION_DESC);
  rangeProtection.setWarningOnly(true);
}

function protectDatabase() {
  setProtection(getDatabaseRangeWithBlanks("Database"));
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

// 1-based colIndex
function getRangeCol(range, colIndex) {
  return range.offset(0, colIndex - 1, range.getNumRows(), 1);
}

const CALC_FIELD_INDICES = Object.freeze({
  RunningTotal: 1,
  GrantType: 2,
  Quarter: 3,
  StreetNumber: 4,
  StreetName: 5,
  Unit: 6,
  Initials: 7,
});

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
  RunningTotal: 19 + CALC_FIELD_INDICES.RunningTotal,
  GrantType: 19 + CALC_FIELD_INDICES.GrantType,
  Quarter: 19 + CALC_FIELD_INDICES.Quarter,
  StreetNumber: 19 + CALC_FIELD_INDICES.StreetNumber,
  StreetName: 19 + CALC_FIELD_INDICES.StreetName,
  Unit: 19 + CALC_FIELD_INDICES.Unit,
  Initials: CALC_FIELD_INDICES.Initials,
});

const PASTE_FIELD_INDICES = Object.freeze({
  Name: 1,
  Phone: 2,
  Address: 3,
  Type: 4,
  ApptDate: 5,
  ApptTime: 6,
  ApptDest: 7,
  Provided: 8,
  Driver: 9,
  Scheduler: 10,
  LogDate: 11,
  Trip: 12,
  Comments: 13,
  Notes: 14,
  Taxi: 15,
  Return: 16,
  Total: 17,
});

const LISTING_FIELD_INDICES = Object.freeze({
  OrgInitial: 1,
  StreetNum: 2,
  StreetName: 3,
  StreetType: 4,
  UnitType: 5,
  UnitNum: 6,
  City: 7,
  State: 8,
  ClientInitial: 9,
  Q1: 10,
  Q2: 11,
  Q3: 12,
  Q4: 13,
});

function clearAll() {
  SpreadsheetApp.flush();
  getPasteRange().clearContent();
  setPlainFormat(getTotalRange().setValue(0));
  setCurrencyFormat(getTotalCurrencyRange());
  getDatabaseRange().clearContent();
  getAddressReportRange().clearContent();
  getCalculatedFieldsRange().clearContent();
}
