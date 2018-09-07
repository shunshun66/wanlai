'use strict';

/**
 * 获取记录总数
 * @param {*} schema
 * @param {*} search
 */
function totalFind(schema, search) {
  return new Promise((resolve, reject) => {
    schema.count(search).exec(function(err, total) {
      if (err) {
        reject(err);
      } else {
        resolve(total);
      }
    });
  });
}

/**
 * 分页查询记录
 * @param {*} schema
 * @param {*} search
 * @param {*} selection
 * @param {*} sort
 * @param {*} page
 */
function recordsFind(schema, search, selection, sort, page) {
  return new Promise((resolve, reject) => {
    schema.find(search, selection).sort(sort).skip((+page.current - 1) * (+page.limit))
      .limit(+page.limit)
      .exec(function(err, doc) {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
  });
}

/**
 * 联合分页查询记录
 * @param {*} schema
 * @param {*} search
 * @param {*} selection
 * @param {*} poplate
 * @param {*} popselects
 * @param {*} sort
 * @param {*} page
 */
function populateFind(schema, search, selection, poplate, popselects, sort, page) {
  return new Promise((resolve, reject) => {
    schema.find(search, selection).populate(poplate, popselects).sort(sort)
      .skip((+page.current - 1) * (+page.limit))
      .limit(+page.limit)
      .exec(function(err, doc) {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
  });
}

module.exports = {
  async listQuery(schema, search, selection, sort, page) {
    for (let key in search) {
      if (search[key] === null || search[key] === undefined || search[key] === '') {
        delete search[key];
      }
    }
    try {
      const data = await Promise.all([
        totalFind(schema, search),
        recordsFind(schema, search, selection, sort, page),
      ]);
      return {
        page: {
          total: data[0],
        },
        results: data[1],
      };
    } catch (err) {
      return {
        err,
      };
    }
  },

  // 联合查询
  async listPopulateQuery(schema, search, selection, poplate, popselects, sort, page) {
    for (let key in search) {
      if (search[key] === null || search[key] === undefined || search[key] === '') {
        delete search[key];
      }
    }
    try {
      const data = await Promise.all([
        totalFind(schema, search),
        populateFind(schema, search, selection, poplate, popselects, sort, page),
      ]);
      return {
        page: {
          total: data.total,
        },
        results: data.records,
      };
    } catch (err) {
      return {
        err,
      };
    }
  },
};
