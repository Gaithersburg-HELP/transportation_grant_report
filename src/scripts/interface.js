// Returns 1 for July-September, etc. If date is invalid, returns NaN
function getQuarter(date) {
  switch (new Date(date).getMonth()) {
    case 0:
    case 1:
    case 2:
      return 3;
    case 3:
    case 4:
    case 5:
      return 4;
    case 6:
    case 7:
    case 8:
      return 1;
    case 9:
    case 10:
    case 11:
      return 2;
    default:
      return NaN;
  }
}

function getInitials(name) {
  const words = cleanString(name).split(" ");
  let initials = "";
  words.forEach((word) => {
    initials += word.slice(0, 1).toUpperCase();
  });
  return initials;
}

function userRecalculateTotalsAddresses() {
  // TODO Step 1) Sort by quarter, then by In City, then by Appointment Date
  // TODO Step 2) compute running total

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
