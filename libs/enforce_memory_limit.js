/** Make sure that the service is staying underneath a memory limit

  {
    check_interval: <Check Every Milliseconds Number>
    memory_limit: <Max Memory in Megabytes Number>
  }
*/
module.exports = (args) => {
  return setInterval(() => {
    const memoryUsage = Math.round(process.memoryUsage().rss / 1024 / 1024);

    // Do not allow this process to exceed memory limit
    if (memoryUsage > args.memory_limit) { process.exit(); }
  },
  args.check_interval);
};

