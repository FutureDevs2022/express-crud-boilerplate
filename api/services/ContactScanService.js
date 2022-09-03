// const jsonfile = require("jsonfile");
const _ = require("lodash");
// const moment = require("moment-timezone");
const path = require("path");
const fs = require("fs");
const { phone_regex } = require("../constants/expressions");
const csv = require("csv-parser");

module.exports.ContactScanService = class {
  constructor() {
    // super();
    // moment.tz(TIMEZONE);
  }

  fetchContactFiles = () => {
    return new Promise((resolve, reject) => {
      //joining path of directory
      const directoryPath = path.join(__dirname, "../constants/data/contacts");
      //passsing directoryPath and callback function
      fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
          return console.log("Unable to scan directory: " + err);
        }
        files = _.filter(files, function(file){
          return file.endsWith(".csv")
        })
        resolve(
          _.map(files, function (file) {
            return {
              name: file.replace(".csv", ""),
              path: path.join(directoryPath, file),
            };
          })
        );
      });
    });
  };

  async scan() {
    return new Promise((resolve, reject) => {
      try {
        // create a JSON file for each collection path
        this.fetchContactFiles()
          .then((files) => {
            const contactFiles = [];
            console.log("Extracting Contacts...", _.size(files));
            for (let index in files) {
              const file = files[index];
              const results = [];
              fs.createReadStream(file.path)
                .pipe(csv())
                .on("data", (data) => results.push(data))
                .on("end", () => {
                  contactFiles.push({ name: file.name, data: results });
                  console.log(`Done compiling ${file.name} =>`, results.length);
                  if (_.isEqual(_.size(contactFiles), _.size(files))) {
                    console.log("Compilation complete", contactFiles.length);
                    resolve(contactFiles);
                  }
                });
            }
          })
          .catch((error) => {
            console.log("Error encountered", error);
            reject(error);
          });
      } catch (error) {
        console.log("Error encountered", error);
        reject(error);
      }
    });
  }
};
