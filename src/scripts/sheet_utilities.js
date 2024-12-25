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

function getMostRecentRange() {
  return getPasteSheet().getRange("A4");
}

function getTotalRange() {
  return getHomeSheet().getRange("H2:K9");
}

function getCalculatedFieldsRange() {
  return getHomeSheet().getRange("T13:Z3000");
}

function getDatabaseRange() {
  let dbRange = null;

  getHomeSheet()
    .getNamedRanges()
    .forEach((namedRange) => {
      if (namedRange.getName() === "Database") {
        dbRange = namedRange;
      }
    });
  return dbRange.getRange();
}

const DB_PROTECTION_DESC = "protect database";

function setProtection(rangeToProtect) {
  const rangeProtection = rangeToProtect.protect();
  rangeProtection.setDescription(DB_PROTECTION_DESC);
  rangeProtection.setWarningOnly(true);
}

function protectDatabase() {
  setProtection(getDatabaseRange());
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

function getAddressReportRange() {
  return getAddressReportSheet().getRange("A2:M3000");
}

function clearAll() {
  SpreadsheetApp.flush();
  getMostRecentRange().setValue("most recent visit date already added:");
  getPasteRange().clearContent();
  getTotalRange().setValue(0);
  getDatabaseRange().clearContent();
  getAddressReportRange().clearContent();
  getCalculatedFieldsRange().clearContent();
}
