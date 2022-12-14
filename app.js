require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const swaggerJSON = require("./api/swagger.json");
const _ = require("lodash");
const routes = require("./api/routes");

try {
  if(!process.env.MONGO_DB_USER_NAME || !process.env.MONGO_DB_PASSWORD || !process.env.MONGO_DB_CLUSTER || !process.env.MONGO_DB_NAME) throw new Error("Incomplete Mongo DB connection credentials")
  // connect to mongodb
  mongoose
    .connect(
      `mongodb+srv://${process.env.MONGO_DB_USER_NAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_CLUSTER}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then((res) => {
      // default node modules promise (optional)
      mongoose.Promise = global.Promise;
      console.log(`Connected to ${process.env.MONGO_DB_NAME} database`);
    })
    .catch((err) => {
      console.error(`${process.env.MONGO_DB_NAME}`, err);
    });

  // default node modules promise (optional)
  mongoose.Promise = global.Promise;
} catch (error) {
  console.log("MONGO DB CONN ERR  =>", error.message);
}

const swaggerOptions = {
  swaggerDefinition: {
    ...swaggerJSON,
    tags: _.sortBy(swaggerJSON.tags, "name"),
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
// logger
app.use(morgan("dev"));

// body parser to parse data sent to the endpoints
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// add headers to allow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, datatype, seedphrase",
  );
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "PUT",
      "POST",
      "PATCH",
      "DELETE",
      "GET"
    );
    return res.status(200).json({});
  }
  next();
});

// routes
const base_path = "/api/v1";
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
routes.map((route) => {
  app.use(route.path, route.handler);
});

// request handler for invalid routes
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});
// invalid request handler ends her

module.exports = app;
