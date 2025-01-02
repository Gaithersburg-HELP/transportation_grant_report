function testAddressPrefixPostfix() {
  let assertion = true;

  const difficultAddress = new Address("330 North Market Street West Apartment 240 , ");
  assertion = assertion && difficultAddress.streetNum === "330";
  assertion = assertion && difficultAddress.prefixedStreetName === "N Market";
  assertion = assertion && difficultAddress.streetType === "ST";
  assertion = assertion && difficultAddress.unitType === "Apt";
  assertion = assertion && difficultAddress.unitNum === "240";
  assertion = assertion && difficultAddress.formattedStreetWithUnit === "330 N Market St W Apt 240";

  return assertion;
}

function testQuarter() {
  let assertion = true;
  assertion = assertion && getQuarter("07/05/2024") === 1;
  assertion = assertion && getQuarter("08/05/2024") === 1;
  assertion = assertion && getQuarter("09/05/2024") === 1;
  assertion = assertion && getQuarter("10/05/2024") === 2;
  assertion = assertion && getQuarter("11/05/2024") === 2;
  assertion = assertion && getQuarter("12/05/2024") === 2;
  assertion = assertion && getQuarter("1/05/2024") === 3;
  assertion = assertion && getQuarter("2/05/2024") === 3;
  assertion = assertion && getQuarter("3/05/2024") === 3;
  assertion = assertion && getQuarter("4/05/2024") === 4;
  assertion = assertion && getQuarter("5/05/2024") === 4;
  assertion = assertion && getQuarter("6/05/2024") === 4;

  return assertion;
}

function testInitials() {
  let assertion = true;
  assertion = assertion && getInitials("Jonathan V'Nai Hypohen-Joseph") === "JVH";

  return assertion;
}
