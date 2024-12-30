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
