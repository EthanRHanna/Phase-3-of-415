const { json2xml, xml2json } = require("xml-js");

function jsToXml(str) {
  return json2xml(str);
}

function xmlToJs(xmlFile) {
  return xml2json(xmlFile);
}
