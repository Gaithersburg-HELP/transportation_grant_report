function validateCategorizeDatabase() {
  SpreadsheetApp.getActive().toast(`Beginning validation and categorization...`, `Progress`, -1);

  // Sort by appointment date so we can preserve the earliest InCity value for the same address later
  getDatabaseRange("DatabaseAndCalculated").sort([{ column: DB_FIELD_INDICES.ApptDate, ascending: true }]);

  const categories = [];
  const addressValidations = new Map();

  const dbLength = getDatabaseRange().getNumRows();
  const database = getDatabaseRange().getValues();

  let row = 1;
  while (row <= dbLength) {
    const currentRow = database[row - 1];

    // Preserve existing categories as they may have been edited by the user
    if (currentRow[DB_FIELD_INDICES.Category - 1]) {
      categories.push(currentRow[DB_FIELD_INDICES.Category - 1]);
    } else {
      let category = currentRow[DB_FIELD_INDICES.Type - 1];
      switch (category) {
        case "Medical/Dental":
        case "Other":
          category = "Health Appt";
          break;
        case "Agency":
          category = "Social Svc Agcy";
          break;
        case "Medical Covid-19 Vaccination":
          category = "Vax/Testing";
          break;
      }

      categories.push(category);
    }

    // NOTE assumes no duplicate street names in neighboring cities
    const address = new Address(currentRow[DB_FIELD_INDICES.Address - 1]).formattedStreetWithUnit;

    if (addressValidations.has(address)) {
      // Check edge case where we have a new record added in an earlier quarter
      // but was already validated in a later quarter
      // so we can preserve the existing InCity value so we can keep user edits
      if (!addressValidations.get(address).skipValidation && currentRow[DB_FIELD_INDICES.InCity - 1]) {
        addressValidations.get(address).inCity = currentRow[DB_FIELD_INDICES.InCity - 1] === "Yes";
        addressValidations.get(address).skipValidation = true;
      }
      addressValidations.get(address).rows.push(row);
    } else {
      const validation = new AddressValidation(row);
      // Persist Yes/Discard value for earliest record in database to all records with same address
      // This means we can keep user edits for the address
      if (currentRow[DB_FIELD_INDICES.InCity - 1]) {
        validation.inCity = currentRow[DB_FIELD_INDICES.InCity - 1] === "Yes";
        validation.skipValidation = true;
      }
      addressValidations.set(address, validation);
    }
    row += 1;
  }

  validateAddresses(addressValidations);

  const inCity = [];
  addressValidations.forEach((validation) => {
    validation.rows.forEach((validatedRow) => {
      // inCity is zero-based but AddressValidation rows are 1-based
      if (validation.inCity) {
        inCity[validatedRow - 1] = "Yes";
      } else {
        inCity[validatedRow - 1] = "Discard";
      }
    });
  });

  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.InCity).setValues(transpose([inCity])));
  setPlainFormat(getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Category).setValues(transpose([categories])));

  SpreadsheetApp.getActive().toast(`Finished validation and categorization!`, `Progress`, -1);
}
