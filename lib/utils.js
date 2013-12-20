
module.exports.execJSON = execJSON;
function execJSON (data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}