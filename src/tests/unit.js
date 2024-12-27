function testAddressPrefixPostfix() {
  let assertion = true;

  const difficultAddress = new Address("330 North Market Street West Apartment 240 , ");
  assertion = assertion && difficultAddress.streetNum === "330";
  assertion = assertion && difficultAddress.prefixedStreetName === "N Market";
  assertion = assertion && difficultAddress.streetType === "St";
  assertion = assertion && difficultAddress.unitType === "Apt";
  assertion = assertion && difficultAddress.unitNum === "240";
  assertion = assertion && difficultAddress.formattedStreetWithUnit === "330 N Market St W Apt 240";

  return assertion;
}

function testMaximumValidation() {
  // maximum number of rides/month is somewhere around 140, 140*12 = 1680 addresses
  // url fetchall maxes out at 2199: https://stackoverflow.com/questions/67580847/maximum-number-of-request-parameters-for-fetchall

  const addressValidations = new Map();

  for (let x = 0; x < 1700; x++) {
    const address = `${x} N Frederick Ave , Gaithersburg`;
    addressValidations.set(new Address(address).formattedStreetWithUnit, new AddressValidation(1));
  }

  validateAddresses(addressValidations);

  let assertion = true;
  assertion =
    assertion &&
    addressValidations.get(new Address("100 N Frederick Ave , Gaithersburg").formattedStreetWithUnit).inCity === true;
  assertion =
    assertion &&
    addressValidations.get(new Address("481 N Frederick Ave , Gaithersburg").formattedStreetWithUnit).inCity === true;
  assertion =
    assertion &&
    addressValidations.get(new Address("990 N Frederick Ave , Gaithersburg").formattedStreetWithUnit).inCity === true;

  return assertion;
}
