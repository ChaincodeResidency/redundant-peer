/** Log an error

  {
    err: <Error Object>
  }
*/
module.exports = (args) => {
  if (!args || !args.err) { return console.log("EXPECTED ERR", args); }

  console.log("ERROR", args.err);
};

