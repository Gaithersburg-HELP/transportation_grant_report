// from https://stackoverflow.com/a/196991/13342792
function toTitleCase(str) {
  return str.replace(/\w\S*/gu, (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase());
}

// Replaces 2 or 3 spaces with single space, trims, returns result as ProperCase
function cleanString(str) {
  let cleanStr = str.trim();
  cleanStr = cleanStr.replaceAll("   ", " ");
  cleanStr = cleanStr.replaceAll("  ", " ");
  // Street numbers can have periods, see https://pe.usps.com/text/pub28/28c2_013.htm
  return toTitleCase(cleanStr);
}

function leftWordSplit(str) {
  const firstSpaceIndex = str.indexOf(" ");
  const leftWord = str.slice(0, Math.max(0, firstSpaceIndex));
  const rightWords = str.slice(Math.max(0, firstSpaceIndex + 1));
  return [leftWord, rightWords];
}

function rightWordSplit(str) {
  const lastSpaceIndex = str.lastIndexOf(" ");
  const leftWords = str.slice(0, Math.max(0, lastSpaceIndex));
  const rightWord = str.slice(Math.max(0, lastSpaceIndex + 1));
  return [leftWords, rightWord];
}

// Formats and splits a raw address
function Address(rawAddress) {
  // There are no addresses in Gaithersburg which have commas like Bldg A, Ste 410
  // and street numbers/names don't have commas so it's safe to split on comma before City
  let rawStreetWithUnit = rawAddress.split(",")[0];

  rawStreetWithUnit = cleanString(rawStreetWithUnit);

  // as of 12/26/24 only unit types in Gaithersburg are Unit, Bldg, Fl, Ste, Apt, so ignore other designators
  rawStreetWithUnit = rawStreetWithUnit
    .replaceAll("Building", "Bldg")
    .replaceAll("Floor", "Fl")
    .replaceAll("Suite", "Ste")
    .replaceAll("Apartment", "Apt")
    .replaceAll("Apt.", "Apt")
    .replaceAll("Apt # ", "Apt ")
    .replaceAll("Apt #", "Apt ")
    .replaceAll("Apt#", "Apt ")
    .replaceAll("# ", "Apt ")
    .replaceAll("#", "Apt");

  // Gaithersburg has O'Neill and Odend'hal, sometimes misspelled as Oneill and Oneil and Odendhal
  // Mccausland Pl renamed to Prism Pl
  rawStreetWithUnit = rawStreetWithUnit.replaceAll("Oneill", "O'neill");
  rawStreetWithUnit = rawStreetWithUnit.replaceAll("Oneil", "O'neill");
  rawStreetWithUnit = rawStreetWithUnit.replaceAll("Odendhal", "Odend'hal");
  rawStreetWithUnit = rawStreetWithUnit.replaceAll("Mccausland", "Prism");

  let street = rawStreetWithUnit;
  let unitType = "";
  let unitNum = "";
  for (const possibleUnitType of ["Apt ", "Bldg ", "Fl ", "Ste "]) {
    const unitTypeIndex = rawStreetWithUnit.indexOf(possibleUnitType);
    if (unitTypeIndex !== -1) {
      street = rawStreetWithUnit.slice(0, Math.max(0, unitTypeIndex));
      const splitUnit = rawStreetWithUnit.slice(Math.max(0, unitTypeIndex)).split(" ");
      unitType = splitUnit.shift();
      // possibility of 3 words e.g. 103 Rm 1
      unitNum = splitUnit.join(" "); // [].join(" ") returns ""
      break;
    }
  }

  // Add spaces to left and right of street name (temporarily) for replace operations (avoid e.g. Westland Dr)
  street = ` ${street} `;
  street = street.replaceAll(" Northwest ", " NW ");
  street = street.replaceAll(" Southwest ", " SW ");
  street = street.replaceAll(" Northeast ", " NE ");
  street = street.replaceAll(" Southeast ", " SE ");
  street = street.replaceAll(" North ", " N ");
  street = street.replaceAll(" South ", " S ");
  street = street.replaceAll(" East ", " E ");
  street = street.replaceAll(" West ", " W ");

  street = street.trim();

  street = street.replaceAll("Avenue", "Ave");
  street = street.replaceAll("Boulevard", "Blvd");
  street = street.replaceAll("Circle", "Cir");
  street = street.replaceAll("Close", "Cls");
  street = street.replaceAll("Court", "Ct");
  street = street.replaceAll("Drive", "Dr");
  street = street.replaceAll("Highway", "Hwy");
  street = street.replaceAll("Lane", "Ln");
  street = street.replaceAll("Mews", "Mews");
  street = street.replaceAll("Parkway", "Pkwy");
  street = street.replaceAll("Place", "Pl");
  street = street.replaceAll("Road", "Rd");
  // No 'Square' street type in Gaithersburg but it is present in street name so don't replace
  street = street.replaceAll("Street", "St");
  street = street.replaceAll("Terrace", "Ter");
  street = street.replaceAll("Way", "Way");

  const leftWordSplitStreet = leftWordSplit(street);
  const streetNum = leftWordSplitStreet[0];
  let streetWithoutNum = leftWordSplitStreet[1];

  // Remove periods, hyphens, not in street name
  // see https://pe.usps.com/text/pub28/28c2_013.htm & https://pe.usps.com/text/dmm100/addressing-mail.htm
  streetWithoutNum = streetWithoutNum.replaceAll(".", "");
  streetWithoutNum = streetWithoutNum.replaceAll("-", "");

  let realPostfix = "";

  const [possibleStreetWithoutPostfix, possiblePostfix] = rightWordSplit(streetWithoutNum);
  switch (possiblePostfix) {
    case "NE":
    case "NW":
    case "SW":
    case "SE":
    case "N":
    case "E":
    case "S":
    case "W":
      realPostfix = possiblePostfix;
      streetWithoutNum = possibleStreetWithoutPostfix;
      break;
  }

  const [prefixedStreetName, streetType] = rightWordSplit(streetWithoutNum);

  let formattedStreetWithUnit = `${streetNum} ${streetWithoutNum}`;
  if (realPostfix !== "") {
    formattedStreetWithUnit = `${formattedStreetWithUnit} ${realPostfix}`;
  }

  const formattedStreetWithoutUnit = formattedStreetWithUnit;

  if (unitType !== "") {
    formattedStreetWithUnit = `${formattedStreetWithUnit} ${unitType} ${unitNum}`;
  }

  Object.defineProperties(this, {
    streetNum: { value: streetNum },
    prefixedStreetName: { value: prefixedStreetName },
    streetType: { value: streetType }, // drops postfix, following what Gaithersburg database Road_Type field does
    unitType: { value: unitType },
    unitNum: { value: unitNum },
    formattedStreetWithUnit: { value: formattedStreetWithUnit }, // Street Num + Prefix + Street Name + Street Type + Postfix + Unit Type + Unit Num
    formattedStreetWithoutUnit: { value: formattedStreetWithoutUnit },
  });
}

function AddressValidation(row) {
  this.rows = [row];
  this.inCity = false;
}

// Expects HTTPResponse, logs to output and returns false if invalid, otherwise returns true
function isValidResponse(response) {
  const code = response.getResponseCode();
  const result = JSON.parse(response.getContentText());
  if ((code >= 400 && code <= 599) || Object.hasOwn(result, "error") || response.getContentText() === "") {
    Logger.log(
      `Error validating address: ${code.toString()} - ${JSON.stringify(
        response.getAllHeaders(),
      )} - ${response.getContentText()}`,
    );
    return false;
  }
  return true;
}

// Expects Map of Address : AddressValidation
// Modifies AddressValidation objects to validation result
function validateAddresses(addressValidations) {
  const addressesInRequestOrder = [];
  const requests = [];
  addressValidations.forEach((validation, address) => {
    escapedAddress = address.replaceAll("'", "''");
    const url =
      `https://maps.gaithersburgmd.gov/arcgis/rest/services/layers/GaithersburgCityAddresses/` +
      `MapServer/0/query?` +
      `f=json&returnGeometry=false&` +
      `outFields=Full_Address,Address_Number,Road_Prefix_Dir,Road_Name,Road_Type,Road_Post_Dir,Unit_Type,Unit_Number,Zip_Code&` +
      `where=Full_Address%20LIKE%20%27${encodeURI(escapedAddress)}%27`;
    requests.push(url);
    addressesInRequestOrder.push(address);
  });

  const reattemptValidationRequests = [];
  const reattemptAddressesInRequestOrder = [];

  const responses = UrlFetchApp.fetchAll(requests);
  responses.forEach((response, index) => {
    const result = JSON.parse(response.getContentText());
    if (!isValidResponse(response)) {
      addressValidations.get(addressesInRequestOrder[index]).inCity = false;
    } else {
      if (result.features.length > 0) {
        addressValidations.get(addressesInRequestOrder[index]).inCity = true;
      } else {
        // Reattempt validation with no unit since some addresses like Booth St don't have units
        // in Gaithersburg database
        const addressNoUnit = new Address(addressesInRequestOrder[index]).formattedStreetWithoutUnit.replaceAll(
          "'",
          "''",
        );
        const url =
          `https://maps.gaithersburgmd.gov/arcgis/rest/services/layers/GaithersburgCityAddresses/` +
          `MapServer/0/query?` +
          `f=json&returnGeometry=false&` +
          `outFields=Full_Address,Address_Number,Road_Prefix_Dir,Road_Name,Road_Type,Road_Post_Dir,Unit_Type,Unit_Number,Zip_Code&` +
          `where=Core_Address%20LIKE%20%27${encodeURI(addressNoUnit)}%27`;
        reattemptValidationRequests.push(url);
        reattemptAddressesInRequestOrder.push(addressesInRequestOrder[index]);
      }
    }
  });

  const reattemptResponses = UrlFetchApp.fetchAll(reattemptValidationRequests);
  reattemptResponses.forEach((reattemptResponse, index) => {
    const result = JSON.parse(reattemptResponse.getContentText());

    addressValidations.get(reattemptAddressesInRequestOrder[index]).inCity =
      isValidResponse(reattemptResponse) && result.features.length > 0;
  });
}
