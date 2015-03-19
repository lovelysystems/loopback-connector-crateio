module.exports = mixinDiscovery;

function mixinDiscovery(Crate) {
  var async = require('async');

  function paginateSQL(sql, orderBy, options) {
    options = options || {};
    var limit = '';
    if (options.offset || options.skip || options.limit) {
        limit = ' LIMIT ' + (options.offset || options.skip || 0); // Offset starts from 0
        if (options.limit) {
            limit = limit + ',' + options.limit;
        }
    }
    if (orderBy) {
        sql += ' ORDER BY ' + orderBy;
    }
    return sql + limit;
  }

  /*!
   * Build sql for listing tables
   * @param options {all: for all owners, owner: for a given owner}
   * @returns {string} The sql statement
   */
  function queryTables(options) {
    var sqlTables = null;
    var owner = options.owner || options.schema;

    sqlTables = paginateSQL('SELECT ' +
                            ' \'table\' AS "type",' +
                            ' table_name AS "name", ' +
                            ' schema_name AS "owner" ' +
                            'FROM' +
                            ' information_schema.tables' +
                            ' WHERE ' +
                            '  schema_name = \'doc\'',
                            'table_name',
                            options);
    return sqlTables;
  }

  /**
   * Discover model definitions
   *
   * @param {Object} options Options for discovery
   * @param {Function} [cb] The callback function
   */
  Crate.prototype.discoverModelDefinitions = function (options, cb) {
    if (!cb && typeof options === 'function') {
      cb = options;
      options = {};
    }
    options = options || {};
    this.query(queryTables(options), cb);
  };

  /*!
   * Normalize the arguments
   * @param table string, required
   * @param options object, optional
   * @param cb function, optional
   */
  function getArgs(table, options, cb) {
    if ('string' !== typeof table || !table) {
      throw new Error('table is a required string argument: ' + table);
    }
    options = options || {};
    if (!cb && 'function' === typeof options) {
      cb = options;
      options = {};
    }
    if (typeof options !== 'object') {
      throw new Error('options must be an object: ' + options);
    }
    return {
      owner: options.owner || options.schema,
      table: table,
      options: options,
      cb: cb
    };
  }

  /*!
   * Build the sql statement to query columns for a given table
   * @param owner
   * @param table
   * @returns {String} The sql statement
   */
  function queryColumns(owner, table) {
    return paginateSQL(
          'SELECT' +
          ' table_name AS "tableName",' +
          ' column_name AS "columnName",' +
          ' data_type AS "dataType"' +
          'FROM' +
          ' information_schema.columns' +
          (table ? ' WHERE table_name=\'' + table + '\'' : ''),
          'column_name',
          {});
  }

  /**
   * Discover model properties from a table
   * @param {String} table The table name
   * @param {Object} options The options for discovery
   * @param {Function} [cb] The callback function
   *
   */
  Crate.prototype.discoverModelProperties = function (table, options, cb) {
    var args = getArgs(table, options, cb);
    var owner = args.owner;
    if(!owner){
        owner = inheritOwnerViaDataSource.call(this);
    }
    table = args.table;
    options = args.options;
    cb = args.cb;

    var sql = queryColumns(owner, table);
    var callback = function (err, results) {
        if (!err) {
            results.map(function (r) {
                r.type = crateDataTypeToJSONType(r.dataType, r.dataLength);
                r.nullable = 'Y';
            });
        }
        cb(err, results);
    };
    this.query(sql, callback);
  };

  /*!
   * Build the sql statement for querying primary keys of a given table
   * @param owner
   * @param table
   * @returns {string}
   */
  function queryForPrimaryKeys(owner, table) {
    var sql = 'SELECT' +
              ' schema_name AS "owner", ' +
              ' table_name AS "tableName",' +
              ' constraint_name AS "pkNames" ' +
              'FROM' +
              ' information_schema.table_constraints ' +
              'WHERE' +
              ' constraint_type=\'PRIMARY_KEY\'';

    if (owner) {
        sql += ' AND schema_name=\'' + owner + '\'';
    }
    if (table) {
        sql += ' AND table_name=\'' + table + '\'';
    }
    sql += ' ORDER BY schema_name, table_name';
    return sql;
  }

  /**
   * Discover primary keys for a given table
   * @param {String} table The table name
   * @param {Object} options The options for discovery
   * @param {Function} [cb] The callback function
   */
  Crate.prototype.discoverPrimaryKeys = function (table, options, cb) {
    var args = getArgs(table, options, cb);
    var owner = args.owner;
    if(!owner){
      owner = inheritOwnerViaDataSource.call(this);
    }
    table = args.table;
    options = args.options;
    cb = args.cb;

    var sql = queryForPrimaryKeys(owner, table);
    function prepareResult(err, data) {
        if (!err) {
            data.map(function (r) {
                r.pkCols = r.pkNames;
                r.pkName = r.pkNames.join('.');
            });
        }
        cb(err, data);
    }
    this.query(sql, prepareResult);
  };

  /**
   * Discover foreign keys for a given table
   * @param {String} table The table name
   * @param {Object} options The options for discovery
   * @param {Function} [cb] The callback function
   */
  Crate.prototype.discoverForeignKeys = function (table, options, cb) {
      cb(null, []);
  };

  /**
   * Discover foreign keys that reference to the primary key of this table
   * @param {String} table The table name
   * @param {Object} options The options for discovery
   * @param {Function} [cb] The callback function
   */
  Crate.prototype.discoverExportedForeignKeys = function (table, options, cb) {
      cb(null, []);
  };

  function crateDataTypeToJSONType(crateType, dataLength) {
    var type = crateType.toUpperCase();
    switch (type) {
        case 'STRING':
            return 'String';
        case 'BOOLEAN':
            return 'Boolean';
      case 'INTEGER':
      case 'LONG':
      case 'DOUBLE':
      case 'FLOAT':
      case 'BYTE':
        return 'Number';
      case 'TIMESTAMP':
        return 'Date';
      case 'OBJECT':
        return 'Object';
      case 'GEO_POINT':
        return 'GeoPoint';
      default:
        return 'String';
    }
  }

  function inheritOwnerViaDataSource(){
    if(this.dataSource && this.dataSource.settings && this.dataSource.settings.database){
      return this.dataSource.settings.database;
    }
    return undefined;
  }
}
