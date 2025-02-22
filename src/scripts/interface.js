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
      case "1":
        this.q1 = true;
        break;
      case "2":
        this.q2 = true;
        break;
      case "3":
        this.q3 = true;
        break;
      case "4":
        this.q4 = true;
        break;
    }
  };
}

class CityTotals {
  constructor() {
    const blankTotals = { 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0 };
    this._totalKeys = [
      "_expenditureProgram",
      "_expenditureResident",
      "_undupProgram",
      "_undupResident",
      "_undupResidentJobInterview",
      "_undupResidentHealth",
      "_undupResidentSocial",
      "_undupResidentVax",
    ];

    for (const key of this._totalKeys) {
      this[key] = JSON.parse(JSON.stringify(blankTotals));
    }

    // Two maps for unduplicated so we can check and double count if same client moves addresses
    this._unduplicatedCityMap = new Map();
    this._unduplicatedCountyMap = new Map();
  }

  output() {
    const numKeys = this._totalKeys.length;
    const totals = Array.from({ length: numKeys }, () => Array(4));
    for (let i = 1; i <= numKeys; i++) {
      for (let j = 1; j <= 4; j++) {
        const key = this._totalKeys[i - 1];
        totals[i - 1][j - 1] = this[key][j.toString()];
      }
    }
    return totals;
  }

  static _setUnduplicated(map, name) {
    if (map.has(name)) {
      return false;
    }
    map.set(name, "_");
    return true;
  }

  // inCity is Boolean
  increment(total, quarter, inCity, name, category) {
    let unduplicatedCity = false;
    let unduplicatedCounty = false;
    if (inCity) {
      unduplicatedCity = CityTotals._setUnduplicated(this._unduplicatedCityMap, name);
    } else {
      unduplicatedCounty = CityTotals._setUnduplicated(this._unduplicatedCountyMap, name);
    }

    this._expenditureProgram[quarter] += Number(total);

    if (unduplicatedCity || unduplicatedCounty) {
      this._undupProgram[quarter] += 1;
    }

    if (inCity) {
      this._expenditureResident[quarter] += Number(total);
      if (unduplicatedCity) {
        this._undupResident[quarter] += 1;

        switch (category) {
          case "Job Interview":
            this._undupResidentJobInterview[quarter] += 1;
            break;
          case "Health Appt":
            this._undupResidentHealth[quarter] += 1;
            break;
          case "Social Svc Agcy":
            this._undupResidentSocial[quarter] += 1;
            break;
          case "Vax/Testing":
            this._undupResidentVax[quarter] += 1;
            break;
        }
      }
    }
  }
}

class RunningTotal {
  constructor(cityGrantLimit, countyGrantLimit) {
    this._runningTotal = 0.0;
    this._grantLimitIndex = Object.freeze({
      City: 0,
      County: 1,
      JCA: 2,
    });
    this._currentGrantLimit = this._grantLimitIndex.City;
    this._lastRunningTotal = [0.0, 0.0]; // index using this._grantLimitIndex
    this.runningTotals = [];
    this.grantTypes = [];
    this._quarter = Object.freeze({
      Q1: 0,
      Q2: 1,
      Q3: 2,
      Q4: 3,
    });
    this._currentQuarter = this._quarter.Q1;
    this._limitsPlusOverage =
      // index using [this._grantLimitIndex][this._quarter]
      [
        [cityGrantLimit, cityGrantLimit, cityGrantLimit, cityGrantLimit],
        [countyGrantLimit, countyGrantLimit, countyGrantLimit, countyGrantLimit],
      ];
  }

  _pushAndSetRunningTotal(grantType, lastRunningTotal) {
    this.runningTotals.push(this._runningTotal);
    this.grantTypes.push(grantType);
    this._lastRunningTotal[this._currentGrantLimit] = lastRunningTotal;
  }

  _calculateRunningTotal(limit, grantType, grantTypeIfOverLimit) {
    if (this._runningTotal < limit) {
      this._pushAndSetRunningTotal(grantType, this._runningTotal);
    } else if (this._runningTotal === limit) {
      this._pushAndSetRunningTotal(grantType, limit);

      this._runningTotal = 0.0;
      this._currentGrantLimit += 1;
    } else {
      this._runningTotal -= limit;

      this._pushAndSetRunningTotal(grantTypeIfOverLimit, limit);

      this._currentGrantLimit += 1;
    }
  }

  _incrementOverage(grantLimitIndex) {
    this._limitsPlusOverage[grantLimitIndex][this._currentQuarter + 1] =
      this._limitsPlusOverage[grantLimitIndex][this._currentQuarter + 1] +
      this._limitsPlusOverage[grantLimitIndex][this._currentQuarter] -
      this._lastRunningTotal[grantLimitIndex];
  }

  // inCity is boolean
  increment(total, quarter, inCity) {
    if (total === "") {
      this.runningTotals.push("");
      this.grantTypes.push("");
      return;
    }
    if (quarter - 1 > this._currentQuarter) {
      this._incrementOverage(this._grantLimitIndex.City);
      this._incrementOverage(this._grantLimitIndex.County);

      this._currentQuarter += 1;
      this._runningTotal = 0.0;
      this._lastRunningTotal = [0.0, 0.0];
      this._currentGrantLimit = this._grantLimitIndex.City;
    }

    if (!inCity && this._currentGrantLimit === this._grantLimitIndex.City) {
      this._runningTotal = 0.0;
      this._currentGrantLimit = this._grantLimitIndex.County;
    }

    this._runningTotal += total;
    switch (this._currentGrantLimit) {
      case this._grantLimitIndex.City:
        this._calculateRunningTotal(
          this._limitsPlusOverage[this._grantLimitIndex.City][this._currentQuarter],
          "City",
          "County/City",
        );
        break;
      case this._grantLimitIndex.County:
        this._calculateRunningTotal(
          this._limitsPlusOverage[this._grantLimitIndex.County][this._currentQuarter],
          "County",
          "JCA/County",
        );
        break;
      case this._grantLimitIndex.JCA:
      default:
        this.runningTotals.push(this._runningTotal);
        this.grantTypes.push("JCA");
        break;
    }
  }

  static _getOveragesWithLabels(overages) {
    const overagesWithoutQ1 = [...overages];
    overagesWithoutQ1.shift();
    return overagesWithoutQ1.map(
      (overage, index) =>
        `Q${index + 2}: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(overage)}`,
    );
  }

  cityOveragesWithLabel() {
    return RunningTotal._getOveragesWithLabels(this._limitsPlusOverage[this._grantLimitIndex.City]);
  }

  countyOveragesWithLabel() {
    return RunningTotal._getOveragesWithLabels(this._limitsPlusOverage[this._grantLimitIndex.County]);
  }
}

function setYearFormat(range) {
  range.setNumberFormat("M/D/YYYY");
}

function setTimeFormat(range) {
  range.setNumberFormat("[$-409]h:mm\\ AM/PM");
}

function setPlainFormat(range) {
  range.setNumberFormat("@");
}

function setCurrencyFormat(range) {
  range.setNumberFormat('"$"#,##0.00');
}

// For developer use to get formatting
function getFormat() {
  for (const range of SpreadsheetApp.getActiveSheet().getSelection().getActiveRangeList().getRanges()) {
    Logger.log(range.getNumberFormat());
    Logger.log(typeof range.getValue());
  }
}

// For developer use to set formatting
function setFormat() {
  for (const range of SpreadsheetApp.getActiveSheet().getSelection().getActiveRangeList().getRanges()) {
    setPlainFormat(range);
  }
  getFormat();
}

function userRecalculateTotalsAddresses() {
  SpreadsheetApp.getActive().toast(
    `Beginning total calculation and address listings report generation...`,
    `Progress`,
    -1,
  );

  // Sort blank rows to the bottom where they will be forgotten
  getDatabaseRange("DatabaseAndCalculated").sort([{ column: DB_FIELD_INDICES.InCity, ascending: false }]);

  // Now sort by date so we can preserve earliest InCity value across all instances of the same addresses
  getDatabaseRange("DatabaseAndCalculated").sort([{ column: DB_FIELD_INDICES.ApptDate, ascending: true }]);

  const dbLength = getDatabaseRange().getNumRows();
  const database = getDatabaseRange().getValues();

  const duplicateAddresses = new Map();
  const updatedInCity = Array.from({ length: dbLength }, () => Array(1));

  const numCalculatedFields = getCalculatedFieldsRange().getNumColumns();

  const calculatedFields = Array.from({ length: dbLength }, () => Array(numCalculatedFields));

  let row = 0;
  while (row < dbLength) {
    // Preserve earliest InCity value
    if (duplicateAddresses.has(database[row][DB_FIELD_INDICES.Address - 1])) {
      updatedInCity[row][0] = duplicateAddresses.get(database[row][DB_FIELD_INDICES.Address - 1]);
    } else {
      duplicateAddresses.set(database[row][DB_FIELD_INDICES.Address - 1], database[row][DB_FIELD_INDICES.InCity - 1]);
      updatedInCity[row][0] = database[row][DB_FIELD_INDICES.InCity - 1];
    }

    const address = new Address(database[row][DB_FIELD_INDICES.Address - 1]);
    // NOTE in theory if date is invalid this would display NaN and cause the record to be unreported
    calculatedFields[row][CALC_FIELD_INDICES.Quarter - 1] = getQuarter(database[row][DB_FIELD_INDICES.ApptDate - 1]);
    calculatedFields[row][CALC_FIELD_INDICES.StreetNumber - 1] = address.streetNum;
    calculatedFields[row][CALC_FIELD_INDICES.StreetName - 1] = address.prefixedStreetNameWithType;
    calculatedFields[row][CALC_FIELD_INDICES.Unit - 1] = address.unitNum;
    calculatedFields[row][CALC_FIELD_INDICES.Initials - 1] = getInitials(database[row][DB_FIELD_INDICES.Name - 1]);

    row += 1;
  }

  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.InCity).setValues(updatedInCity));
  setPlainFormat(getCalculatedFieldsRange().offset(0, 0, dbLength).setValues(calculatedFields));

  getDatabaseRange("DatabaseAndCalculated").sort([
    { column: DB_FIELD_INDICES.Quarter, ascending: true },
    { column: DB_FIELD_INDICES.InCity, ascending: false },
    { column: DB_FIELD_INDICES.ApptDate, ascending: true },
  ]);

  const sortedDatabase = getDatabaseRange("DatabaseAndCalculated").getValues();

  const countyGrantLimit = getCountyFundPerQuarterRange().getValue();
  const cityGrantLimit = getCityFundPerQuarterRange().getValue();
  const runningTotal = new RunningTotal(cityGrantLimit, countyGrantLimit);
  const cityTotals = new CityTotals();

  // Map of Name : AddressListing
  const addressListings = new Map();
  row = 0;
  while (row < dbLength) {
    const name = sortedDatabase[row][DB_FIELD_INDICES.Name - 1];
    if (sortedDatabase[row][DB_FIELD_INDICES.InCity - 1] === "Yes") {
      if (!addressListings.has(name)) {
        addressListings.set(
          name,
          new AddressListing(getInitials(name), new Address(sortedDatabase[row][DB_FIELD_INDICES.Address - 1])),
        );
      }
      addressListings.get(name).setQuarter(sortedDatabase[row][DB_FIELD_INDICES.Quarter - 1]);
    }

    cityTotals.increment(
      sortedDatabase[row][DB_FIELD_INDICES.Total - 1],
      sortedDatabase[row][DB_FIELD_INDICES.Quarter - 1],
      sortedDatabase[row][DB_FIELD_INDICES.InCity - 1] === "Yes",
      sortedDatabase[row][DB_FIELD_INDICES.Name - 1],
      sortedDatabase[row][DB_FIELD_INDICES.Category - 1],
    );

    runningTotal.increment(
      sortedDatabase[row][DB_FIELD_INDICES.Total - 1],
      sortedDatabase[row][DB_FIELD_INDICES.Quarter - 1],
      sortedDatabase[row][DB_FIELD_INDICES.InCity - 1] === "Yes",
    );
    row += 1;
  }

  setPlainFormat(getTotalRange().setValues(cityTotals.output()));
  setCurrencyFormat(getTotalCurrencyRange());

  setPlainFormat(getCityOveragePerQuarterRange().setValues([runningTotal.cityOveragesWithLabel()]));
  setPlainFormat(getCountyOveragePerQuarterRange().setValues([runningTotal.countyOveragesWithLabel()]));

  setCurrencyFormat(
    getRangeCol(getDatabaseRange("DatabaseAndCalculated"), DB_FIELD_INDICES.RunningTotal).setValues(
      transpose([runningTotal.runningTotals]),
    ),
  );
  setPlainFormat(
    getRangeCol(getDatabaseRange("DatabaseAndCalculated"), DB_FIELD_INDICES.GrantType).setValues(
      transpose([runningTotal.grantTypes]),
    ),
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
    addressListingReport[row][LISTING_FIELD_INDICES.Q1 - 1] = addressListing.q1 ? "x" : "";
    addressListingReport[row][LISTING_FIELD_INDICES.Q2 - 1] = addressListing.q2 ? "x" : "";
    addressListingReport[row][LISTING_FIELD_INDICES.Q3 - 1] = addressListing.q3 ? "x" : "";
    addressListingReport[row][LISTING_FIELD_INDICES.Q4 - 1] = addressListing.q4 ? "x" : "";

    row += 1;
  }

  // BUG Fails if no records in address listings
  // should probably include a check for this and clear address report
  // if no address listings
  setPlainFormat(getAddressReportRange().offset(0, 0, addressListingReport.length).setValues(addressListingReport));

  getAddressReportRange().sort([
    { column: LISTING_FIELD_INDICES.ClientInitial, ascending: true },
    { column: LISTING_FIELD_INDICES.StreetNum, ascending: true },
    { column: LISTING_FIELD_INDICES.StreetName, ascending: true },
    { column: LISTING_FIELD_INDICES.StreetType, ascending: true },
    { column: LISTING_FIELD_INDICES.UnitNum, ascending: true },
  ]);

  protectDatabase();

  SpreadsheetApp.getActive().toast(
    `Script is finished! You can close this message and edit this workbook.`,
    `Progress`,
    -1,
  );
}
function userAddRecords(skipWarning = false) {
  if (getPasteRange().isBlank()) {
    return;
  }

  if (!skipWarning) {
    // give warning if any record with Provided = Taxi and Total$ is blank
    const pastedValues = getPasteRange().getValues();
    for (let i = 0; i < pastedValues.length; i++) {
      if (
        pastedValues[i][PASTE_FIELD_INDICES.Provided - 1] === "Taxi" &&
        pastedValues[i][PASTE_FIELD_INDICES.Total - 1] === ""
      ) {
        const response = SpreadsheetApp.getUi().alert(
          `Record in row ${getPasteRange().getRow() + i} is set to 'Taxi' but has no total. Proceed anyway?`,
          SpreadsheetApp.getUi().ButtonSet.YES_NO,
        );
        if (response === SpreadsheetApp.getUi().Button.NO) {
          return;
        }
        break;
      }
    }
  }

  SpreadsheetApp.getActive().toast(`Adding records...`, `Progress`, -1);

  if (getDatabaseRange().isBlank()) {
    getPasteRange().copyTo(getDatabaseRange().getCell(1, DB_FIELD_INDICES.Name));
  } else {
    getPasteRange().copyTo(
      getDatabaseRange().offset(getDatabaseRange().getNumRows(), DB_FIELD_INDICES.Name - 1, 1, 1),
      { contentsOnly: true },
    );
  }

  getPasteRange().clearContent();

  // may run into issues comparing and printing currency/dates/times unless formatting is set correctly
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Name));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Phone));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Address));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Type));
  setYearFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.ApptDate));
  setTimeFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.ApptTime));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.ApptDest));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Provided));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Driver));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Scheduler));
  setYearFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.LogDate));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Trip));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Comments));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Notes));
  setCurrencyFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Taxi));
  setCurrencyFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Return));
  setCurrencyFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Total));

  validateCategorizeDatabase();

  userRecalculateTotalsAddresses();
}

function userClearTotalsAddresses() {
  clearCalculatedFields();
  unprotectDatabase();
}

// From https://stackoverflow.com/a/69015165/13342792
function openUrl(url) {
  const html = `<html>
<a id='url' href="${url}">Click here</a>
  <script>
     var winRef = window.open("${url}");
     winRef ? google.script.host.close() : window.alert('Configure browser to allow popup to redirect you to ${url}') ;
     </script>
</html>`;
  const htmlOutput = HtmlService.createHtmlOutput(html).setWidth(250).setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, `Opening address lookup page in new tab...`);
}

function userLookupAddress() {
  const address = new Address(
    getHomeSheet()
      .getRange(SpreadsheetApp.getSelection().getCurrentCell().getRow(), DB_FIELD_INDICES.Address)
      .getValue(),
  );
  openUrl(
    `https://maps.gaithersburgmd.gov/AddressSearch/index.html?address=${address.formattedStreetWithoutUnit.replace(" ", "+")}`,
  );
}
