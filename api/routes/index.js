const base_path = "/api/v1";

const routes = [
    {
        path: `${base_path}/auth`,
        handler: require("./auth")
    },
    {
        path: `${base_path}/users`,
        handler: require("./user")
    },
    {
        path: `${base_path}/songs`,
        handler: require("./song")
    }
];

module.exports = routes;