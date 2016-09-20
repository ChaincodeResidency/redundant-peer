/** Reduce the size of a hash list by trimming old hashes

  {
    hashes: Array<String>
    interval: <Base Expected Behind Interval>
  }

  @returns
  Array<String>
*/
module.exports = (args) => {
  if (!args.hashes.length) { return args.hashes; }

  // Iterate through the hashes, skipping exponentially more values as it goes

  const firstHash = args.hashes[0];
  const laterHashes = args.hashes.slice(1);

  let ignoreAmount = args.interval;
  let ignoreNext = ignoreAmount;
  let trimmedHashes = [];

  laterHashes.reverse().forEach((hash) => {
    if (ignoreNext > 0) { ignoreNext = ignoreNext - 1; return; }

    trimmedHashes.push(hash);

    ignoreAmount = Math.pow(ignoreAmount, 1.05);

    ignoreNext = ignoreAmount;
  });

  if (!trimmedHashes.length) { return args.hashes; }

  return [firstHash].concat(trimmedHashes.reverse());
};

