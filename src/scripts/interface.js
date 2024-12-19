function userPasteRecords() {
  // TODO paste records
}

function userAddRecords() {
  // TODO move records to Home
  // Validate addresses against ArcGIS
  // Categorize addresses appropriately
  // Calculate totals and addresses
}

function userClearRecalculateTotalsAddresses() {
  getTotalRange().setValue(0);
  getRunningTotalRange().setValue("");
  getAddressReportRange().clearContent();
  unprotectDatabase();
  // TODO calculate totals and addresses
}
