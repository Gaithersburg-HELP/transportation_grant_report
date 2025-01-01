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

// expects Address object for address
function AddressListing(initials, address) {
  Object.defineProperties(this, {
    initials: { value: initials },
    address: { value: address },
  });
  this.q1 = false;
  this.q2 = false;
  this.q3 = false;
  this.q4 = false;
  this.setQuarter = (quarter) => {
    switch (quarter) {
      case 1:
        this.q1 = true;
        break;
      case 2:
        this.q2 = true;
        break;
      case 3:
        this.q3 = true;
        break;
      case 4:
        this.q4 = true;
        break;
    }
  };
}

class RunningTotal {
  constructor(cityGrantLimit, countyGrantLimit) {
    this._cityGrantLimit = cityGrantLimit;
    this._countyGrantLimit = countyGrantLimit;
    this._runningTotal = 0.0;
    this._grantLimitsReached = 0;
    this.runningTotals = [];
    this.grantTypes = [];
  }

  _calculateRunningTotal(limit, grantType, grantTypeIfOverLimit) {
    if (this._runningTotal < limit) {
      this.runningTotals.push(this._runningTotal);
      this.grantTypes.push(grantType);
    } else if (this._runningTotal === limit) {
      this.runningTotals.push(this._runningTotal);
      this.grantTypes.push(grantType);
      this._runningTotal = 0.0;
      this._grantLimitsReached += 1;
    } else {
      this._runningTotal -= limit;
      this.runningTotals.push(this._runningTotal);
      this.grantTypes.push(grantTypeIfOverLimit);
      this._grantLimitsReached += 1;
    }
  }

  increment(total) {
    if (total === "") {
      this.runningTotals.push("");
      this.grantTypes.push("");
      return;
    }
    this._runningTotal += total;
    switch (this._grantLimitsReached) {
      case 0:
        this._calculateRunningTotal(this._cityGrantLimit, "City", "County/City");
        break;
      case 1:
        this._calculateRunningTotal(this._countyGrantLimit, "County", "JCA/County");
        break;
      case 2:
      default:
        this.runningTotals.push(this._runningTotal);
        this.grantTypes.push("JCA");
        break;
    }
  }
}

function userRecalculateTotalsAddresses() {
  const dbLength = getDatabaseRange().getNumRows();
  const database = getDatabaseRange().getValues();

  const numCalculatedFields = getCalculatedFieldsRange().getNumColumns();

  const calculatedFields = Array.from({ length: dbLength }, () => Array(numCalculatedFields));

  let row = 0;
  while (row < dbLength) {
    const address = new Address(database[row][DB_FIELD_INDICES.Address - 1]);
    // NOTE in theory if date is invalid this would display NaN and cause the record to be unreported
    calculatedFields[row][CALC_FIELD_INDICES.Quarter - 1] = getQuarter(database[row][DB_FIELD_INDICES.ApptDate - 1]);
    calculatedFields[row][CALC_FIELD_INDICES.StreetNumber - 1] = address.streetNum;
    calculatedFields[row][CALC_FIELD_INDICES.StreetName - 1] = address.prefixedStreetNameWithType;
    calculatedFields[row][CALC_FIELD_INDICES.Unit - 1] = address.unitNum;
    calculatedFields[row][CALC_FIELD_INDICES.Initials - 1] = getInitials(database[row][DB_FIELD_INDICES.Name - 1]);

    row += 1;
  }

  getCalculatedFieldsRange().offset(0, 0, dbLength).setValues(calculatedFields);

  getDatabaseRange("DatabaseAndCalculated").sort([
    { column: DB_FIELD_INDICES.Quarter, ascending: true },
    { column: DB_FIELD_INDICES.InCity, ascending: false },
    { column: DB_FIELD_INDICES.ApptDate, ascending: true },
  ]);

  const sortedDatabase = getDatabaseRange("DatabaseAndCalculated").getValues();

  const countyGrantLimit = getCountyFundPerQuarterRange().getValue();
  const cityGrantLimit = getCityFundPerQuarterRange().getValue();
  const runningTotal = new RunningTotal(cityGrantLimit, countyGrantLimit);

  // Map of Name : AddressListing
  const addressListings = new Map();
  row = 0;
  while (row < dbLength) {
    const name = sortedDatabase[row][DB_FIELD_INDICES.Name - 1];
    if (!addressListings.has(name)) {
      addressListings.set(
        name,
        new AddressListing(getInitials(name), new Address(sortedDatabase[row][DB_FIELD_INDICES.Address - 1])),
      );
    }
    addressListings.get(name).setQuarter(sortedDatabase[row][DB_FIELD_INDICES.Quarter - 1]);
    runningTotal.increment(sortedDatabase[row][DB_FIELD_INDICES.Total - 1]);
    row += 1;
  }

  getRangeCol(getDatabaseRange("DatabaseAndCalculated"), DB_FIELD_INDICES.RunningTotal).setValues(
    transpose([runningTotal.runningTotals]),
  );
  getRangeCol(getDatabaseRange("DatabaseAndCalculated"), DB_FIELD_INDICES.GrantType).setValues(
    transpose([runningTotal.grantTypes]),
  );

  const addressListingReport = Array.from({ length: addressListings.size }, () =>
    Array(getAddressReportRange().getNumColumns()),
  );

  addressListingsEntries = addressListings.entries();
  row = 0;
  while (row < addressListings.size) {
    const addressListing = addressListingsEntries.next().value[1];
    const address = addressListing.address;
    addressListingReport[row][LISTING_FIELD_INDICES.OrgInitial - 1] = "GBH";
    addressListingReport[row][LISTING_FIELD_INDICES.StreetNum - 1] = address.streetNum;
    addressListingReport[row][LISTING_FIELD_INDICES.StreetName - 1] = address.prefixedStreetName;
    addressListingReport[row][LISTING_FIELD_INDICES.StreetType - 1] = address.streetType;
    addressListingReport[row][LISTING_FIELD_INDICES.UnitType - 1] = address.unitType;
    addressListingReport[row][LISTING_FIELD_INDICES.UnitNum - 1] = address.unitNum;
    addressListingReport[row][LISTING_FIELD_INDICES.City - 1] = "Gaithersburg";
    addressListingReport[row][LISTING_FIELD_INDICES.State - 1] = "MD";
    addressListingReport[row][LISTING_FIELD_INDICES.ClientInitial - 1] = addressListing.initials;
    addressListingReport[row][LISTING_FIELD_INDICES.Q1 - 1] = addressListing.q1;
    addressListingReport[row][LISTING_FIELD_INDICES.Q2 - 1] = addressListing.q2;
    addressListingReport[row][LISTING_FIELD_INDICES.Q3 - 1] = addressListing.q3;
    addressListingReport[row][LISTING_FIELD_INDICES.Q4 - 1] = addressListing.q4;

    row += 1;
  }

  protectDatabase();
}

function setYearFormat(range) {
  range.setNumberFormat("M/D/YYYY");
}

function setTimeFormat(range) {
  range.setNumberFormat("[$-409]h:mm\\ AM/PM");
}

function userAddRecords() {
  if (getPasteRange().isBlank()) {
    return;
  }

  // may run into issues comparing and printing dates/times unless formatting is set correctly
  setYearFormat(getRangeCol(getPasteRange(), PASTE_FIELD_INDICES.ApptDate));
  setYearFormat(getRangeCol(getPasteRange(), PASTE_FIELD_INDICES.LogDate));
  setTimeFormat(getRangeCol(getPasteRange(), PASTE_FIELD_INDICES.ApptTime));

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
