function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map((row) => row[i]));
}

function getPasteSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Paste");
}

function getHomeSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Home");
}

function getAddressReportSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Addresses");
}

function getTestSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TESTS");
}

function getPasteRange() {
  return getPasteSheet().getRange("A7:K1000");
}

function getMostRecentRange() {
  return getPasteSheet().getRange("A4");
}

function getTotalRange() {
  return getHomeSheet().getRange("H2:K9");
}

function getDatabaseRange() {
  return getHomeSheet().getRange("A13:M3000");
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
}
