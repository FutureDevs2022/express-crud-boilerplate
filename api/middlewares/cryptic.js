const jwt = require("jsonwebtoken");
const { Cypher } = require("@zheeno/mnemonic-cypher");


module.exports = (req, res, next) => {
    try {
        req.headers.dataType = "JSON";
        if (req.body.raw) {
            const token = req.headers.authorization.split(" ")[1];
            const { seedPhrase } = jwt.verify(token, process.env.JWT_KEY);
            const cypher = new Cypher();
            const data = cypher.decrypt(req.body.raw, seedPhrase);
            req.body = data;
            req.headers.dataType = "RAW";
            req.headers.seedPhrase = seedPhrase
        }
        next();
    } catch (error) {
        return res.status(401).json({
            message: error.message
        })
    }
}