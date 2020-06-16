import Query from "../domain/query";
import inquirer from "inquirer";
import fs from 'fs'

export default class ParameterHelper {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
    }

    async setParameters() {
        let templateParameters = this.getParamaters();
        let parameters;
        if(this.options.cfParameters){
            this.serverless.cli.log(`Defining CF parameters from file...`)
            let parametersPath = this.options.cfParameters
            parameters = JSON.parse(fs.readFileSync(parametersPath,'utf8'));
        }else{
            this.serverless.cli.log(`Interactive configuration of CF parameters:`)
            let querys = this.buildInteractiveQuerys(templateParameters);
            parameters = await this.makeQuerys(querys);
            this.serverless.cli.log(`Defining CF parameters from answers...`)
        }
        this.setParametersInTemplate(parameters,templateParameters);

    }


    /**
     * 
     * @param {Object} parameters 
     * @param {Object} template 
     */
    setParametersInTemplate(parameters,template){
        for (let key of Object.keys(parameters)) {
            template[key].Default = parameters[key]
        }
    }

    /**
     * Return Parameters from compiled CF Templated
     */
    getParamaters() {
        return this.serverless.service.provider.compiledCloudFormationTemplate.Parameters;
    }

    /**
     * Build a query list for CF Parameters, return a array to pass to node Inquirer
     * @param {Object} cfParameters 
     */
    buildInteractiveQuerys(cfParameters) {
        let arrayQuerys = []
        let arrayJ = Object.keys(cfParameters);

        for (let param of arrayJ) {
            let parameter = cfParameters[param];
            let q = new Query("input");
            q.name = param
            q.message = `Set value for ${param}`
            if (parameter.Default) {
                q.default = parameter.Default
            }
            if (parameter.AllowedPattern || parameter.MinLength || parameter.MaxLength) {
                q.validate = function (value) {
                    let pattern = (parameter.AllowedPattern)?value.match(new RegExp(`${parameter.AllowedPattern}$`)):true;
                    let minLength = (parameter.MinLength)?(value.length >= parameter.MinLength):true;
                    let maxLength = (parameter.MaxLength)?(value.length <= parameter.MaxLength):true;
                    if (pattern && minLength && maxLength) {
                        return true;
                    }
                    return 'Please enter a valid value';
                }
            }
            arrayQuerys.push(q)

        }
        return arrayQuerys;
    }

    /**
     * Make Querys to obtain answer to defulat values for CF Parameters
     * @param {Array<Query>} querys 
     */
    async makeQuerys(querys) {
        let answers = await inquirer.prompt(querys);
        return answers;
    }


}