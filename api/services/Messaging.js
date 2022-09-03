const mailgun = require("mailgun-js");


module.exports.Messaging = class {
    constructor() { }

    send(mData) {
        return new Promise((resolve, reject) => {
            try {
                const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });
                const data = {
                    from: 'Celvz Youth Church <noreply@events.celvz.org>',
                    ...mData
                };
                mg.messages().send(data, function (error, body) {
                    if (error) {
                        return reject(error)
                    }
                    console.log(body);
                    resolve(body)
                });
            } catch (error) {
                reject(error)
            }
        })
    }
}