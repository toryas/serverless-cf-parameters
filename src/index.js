'use strict';

const { default: ParameterHelper } = require("./helper/parameter.helper");

class CFParametersPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'aws:package:finalize:mergeCustomProviderResources': this.setParameters.bind(this)
    };
  }

  async setParameters() {
    let ph = new ParameterHelper(this.serverless, this.options);
    await ph.setParameters();
  }

}

module.exports = CFParametersPlugin;
