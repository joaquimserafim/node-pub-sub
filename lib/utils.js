
module.exports.JSONValid = JSONValid;

function JSONValid (data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
};