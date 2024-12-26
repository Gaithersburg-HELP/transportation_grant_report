function userRecalculateTotalsAddresses() {
  // TODO calculate totals and addresses

  protectDatabase();
}

function userAddRecords() {
  getPasteRange().copyTo(getDatabaseRange().getCell(1, 3), { contentsOnly: true });
  getPasteRange().clearContent();

  validateCategorizeDatabase();

  userRecalculateTotalsAddresses();
}

function userClearTotalsAddresses() {
  getTotalRange().setValue(0);
  getCalculatedFieldsRange().clearContent();
  getAddressReportRange().clearContent();
  unprotectDatabase();
}
