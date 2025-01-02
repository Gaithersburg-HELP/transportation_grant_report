function validateCategorizeDatabase() {
  const categories = [];
  const addressValidations = new Map();

  const dbLength = getDatabaseRange().getNumRows();
  const database = getDatabaseRange().getValues();

  let row = 1;
  while (row <= dbLength) {
    const currentRow = database[row - 1];

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

    // NOTE assumes no duplicate street names in neighboring cities
    const address = new Address(currentRow[DB_FIELD_INDICES.Address - 1]).formattedStreetWithUnit;

    if (addressValidations.has(address)) {
      addressValidations.get(address).rows.push(row);
    } else {
      addressValidations.set(address, new AddressValidation(row));
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
}
