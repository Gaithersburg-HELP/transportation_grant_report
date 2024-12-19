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

function getCityFundPerQuarter() {
  return getHomeSheet().getRange("C4").getValue();
}

function getCountyFundPerQuarter() {
  return getHomeSheet().getRange("C5").getValue();
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

function getRunningTotalRange() {
  return getHomeSheet().getRange("T13:U3000");
}

function getDatabaseRange() {
  return getHomeSheet().getRange("A13:S3000");
}

const DB_PROTECTION_DESC = "protect database";

function protectDatabase() {
  const dbProtection = getDatabaseRange().protect();
  dbProtection.setDescription(DB_PROTECTION_DESC);
  dbProtection.setWarningOnly(true);
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
  getRunningTotalRange().clearContent();
  getDatabaseRange().clearContent();
  getAddressReportRange().clearContent();
}
