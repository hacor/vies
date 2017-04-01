'use strict';

const soap = require('soap');
const endpoint = 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';

module.exports = {
    validate: Validate
};

function Validate(vat_number, country_code) {

    const xmlRegex= /(<([^>]+)>)/ig;

    const payload = {
        vatNumber: vat_number,
        countryCode: country_code.toUpperCase(),
    };

    return new Promise((resolve, reject) => {
        soap.createClient(endpoint, (connectionError, soapClient) => {
            if (connectionError) {
                return reject({
                    error: connectionError,
                });
            }
            soapClient.checkVat(payload, (viesError, viesResult) => {
                if (viesError) {
                    return reject({
                        error: viesError.body.split('<faultstring>')[1].replace(xmlRegex, ''),
                        is_valid: false,
                        data: null,
                    });
                }
                resolve({
                    error: null,
                    is_valid: viesResult.valid,
                    data: viesResult,
                });
            });
        });
    });

}
