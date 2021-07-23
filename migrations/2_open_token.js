const OpenToken = artifacts.require("OpenToken");

module.exports = function (deployer) {
  deployer.deploy(OpenToken);
};
