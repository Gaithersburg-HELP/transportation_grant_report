function AddressValidation(row) {
  this.rows = [row];
  this.inCity = false;
}

function validateCategorizeDatabase() {
  let row = 1;

  const categories = [];
  const addressValidations = new Map();

  const dbLength = getDatabaseRange().getNumRows();

  while (row <= dbLength) {
    const currentRow = getRangeRow(getDatabaseRange(), row);

    let category = currentRow.getCell(1, DB_FIELD_INDICES.Type).getValue();
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
    const address = new Address(currentRow.getCell(1, DB_FIELD_INDICES.Address).getValue()).formattedStreetWithUnit;

    if (addressValidations.has(address)) {
      addressValidations.get(address).rows.push(row);
    } else {
      addressValidations.set(address, new AddressValidation(row));
    }
    row += 1;
  }

  // TODO Validate addresses against ArcGIS

  const inCity = [];
  addressValidations.forEach((validation, address) => {
    // TODO add calculated address fields
    validation.rows.forEach((validatedRow) => {
      // inCity is zero-based but AddressValidation rows are 1-based
      if (validation.inCity) {
        inCity[validatedRow - 1] = "Yes";
      } else {
        inCity[validatedRow - 1] = "Discard";
      }
    });
  });

  getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.InCity).setValues(transpose([inCity]));
  getRangeCol(getDatabaseRange(), DB_FIELD_INDICES.Category).setValues(transpose([categories]));
}
