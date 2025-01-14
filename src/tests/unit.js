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

function testAddressSplit() {
  let assertion = true;

  const roomAddress = new Address("497 Quince Orchard Road Room 205 , Gaithersburg, MD");
  assertion = assertion && roomAddress.streetNum === "497";
  assertion = assertion && roomAddress.prefixedStreetName === "Quince Orchard";
  assertion = assertion && roomAddress.streetType === "RD";
  assertion = assertion && roomAddress.unitType === "Rm";
  assertion = assertion && roomAddress.unitNum === "205";
  assertion = assertion && roomAddress.formattedStreetWithUnit === "497 Quince Orchard Rd Rm 205";

  const unitAddress = new Address("1071 Hillside Lake Terrace Unit 1302 , Gaithersburg, MD");
  assertion = assertion && unitAddress.streetNum === "1071";
  assertion = assertion && unitAddress.prefixedStreetName === "Hillside Lake";
  assertion = assertion && unitAddress.streetType === "TER";
  assertion = assertion && unitAddress.unitType === "Unit";
  assertion = assertion && unitAddress.unitNum === "1302";
  assertion = assertion && unitAddress.formattedStreetWithUnit === "1071 Hillside Lake Ter Unit 1302";

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
