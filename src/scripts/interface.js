function userRecalculateTotalsAddresses() {
  // TODO calculate totals and addresses

  protectDatabase();
}

function userAddRecords() {
  if (getPasteRange().isBlank()) {
    return;
  }

  if (getDatabaseRange().isBlank()) {
    getPasteRange().copyTo(getDatabaseRange().getCell(1, DB_FIELD_INDICES.Name), { contentsOnly: true });
  } else {
    getPasteRange().copyTo(
      getDatabaseRange().offset(getDatabaseRange().getNumRows(), DB_FIELD_INDICES.Name - 1, 1, 1),
      { contentsOnly: true },
    );
  }

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
