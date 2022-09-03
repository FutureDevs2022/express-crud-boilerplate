const { Cypher } = require("@zheeno/mnemonic-cypher");
const _ = require("lodash");

module.exports.genExcludes = (req) => {
  let exclude = _.find(req.query, function (query, index) {
    return index == "$exclude";
  });
  if(!exclude) return "";
  if(typeof(exclude) == "string") exclude = [exclude];
  return _.map(exclude, function (entry) {
    return `-${entry}`;
  }).join(" ")
}

module.exports.genQueryParams = (customName, query, req, callback) => {
  let orQueries = _.find(req.query, function (query, index) {
    return index == "$or";
  });
  let tempOr = [];
  if (orQueries) {
    if (typeof orQueries == "object") {
      _.forEach(orQueries, function (_query) {
        let queryOpt = _.split(_query, ":");
        let dummy = new Object();
        dummy[queryOpt[0]] = queryOpt[1];
        tempOr.push(dummy);
      });
    } else {
      let queryOpt = _.split(orQueries, ":");
      let dummy = new Object();
      dummy[queryOpt[0]] = queryOpt[1];
      tempOr.push(dummy);
    }
  }
  if (!_.isEmpty(query) && !_.isEmpty(query.$or))
    tempOr = _.concat(tempOr, query.$or);
  if (_.size(tempOr) > 0) query = { ...query, $or: tempOr };

  const paths = _.find(req.query, function (query, index) {
    return index == "$include";
  });
  let options = {
    populate: paths,
    select: this.genExcludes(req),
    sort: { createdAt: "desc" },
    page:
      Number(
        _.find(req.query, function (query, index) {
          return index == "$page";
        })
      ) || 1,
    limit:
      Number(
        _.find(req.query, function (query, index) {
          return index == "$limit";
        })
      ) || 10,
    customLabels: {
      docs: customName,
    },
    lean: true,
  };
  let results = {
    query,
    options,
  };
  if (callback) return callback(results);
  return results;
};

module.exports.objectCleaner = (obj) => {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
  return obj;
};

module.exports.OTP_GEN = (len) => {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < len; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

module.exports.removeLeadingPlus = (s) => {
  if (s.substr(0, 1) == "+") return s.substr(1, s.length - 1);
  return s;
};

module.exports.formatPhone = (msisdn) => {
  let prefix = "";
  if(_.startsWith(msisdn, "0")) msisdn = msisdn.substr(1, msisdn.length)
  if (!_.startsWith(msisdn, "234") && !_.startsWith(msisdn, "+234"))
    prefix = `234${prefix}`;
    msisdn = `${prefix}${msisdn}`;
    return this.removeLeadingPlus(msisdn);
};

module.exports.encoder = (data, seedPhrase) => {
  try {
    const cypher = new Cypher();
    return cypher.encrypt(data, seedPhrase);
  } catch (error) {
    console.log(error);
  }
}

module.exports.EventEmitter = {
  _events: {},
  dispatch: function (event, data) {
    if (!this._events[event]) return;
    this._events[event].forEach((callback) => callback(data));
  },
  subscribe: function (event, callback) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
  },
};