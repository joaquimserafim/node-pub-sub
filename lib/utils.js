

function parse (data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

function stringify (data) {
  try {
    return JSON.stringify(data);
  } catch (err) {
    return null;
  }
}

module.exports.json = json;

function json () {}

json.parse = parse;
json.stringify = stringify;