var should = require('./init.js');

describe('crate.object', function () {

  var testTables = ['ModelWithObject', 'ModelWithStrictObject', 'ModelWithSchemaObject'];

  it('should create table with a simple object', function (done) {
    db = getDataSource();
    var ModelWithObject = db.define('ModelWithObject', {
        title: {
            type: String,
            length: 255,
            index: true
        },
        o: {
            type: Object
        }
    });
    db.automigrate(['ModelWithObject'], function (err) {
        should.not.exist(err);
        done(err);
    });
  });

  it('should create table with a simple object', function (done) {
    db = getDataSource();
    var ModelWithObject = db.define('ModelWithStrictObject', {
        title: {
            type: String,
            length: 255,
            index: true
        },
        o: {
            type: Object,
            policy: 'STRICT'
        }
    });
    db.automigrate(['ModelWithStrictObject'], function (err) {
        should.not.exist(err);
        done(err);
    });
  });

  it('should create table with an object using schema', function (done) {
    db = getDataSource();
    var ObjectModel = db.define('ObjectModel', {
        s: {type: String},
        i: {type: Number}
    });
    var ModelWithSchemaObject = db.define('ModelWithSchemaObject', {
        title: {
            type: String,
            length: 255,
            index: true
        },
        o: {
            type: Object,
            policy: 'STRICT',
            schema: 'ObjectModel'
        }
    });
    db.automigrate(['ModelWithSchemaObject'], function (err) {
        should.not.exist(err);
        db.discoverModelProperties(
            'modelwithschemaobject',
            {},
            function(err, data) {
                should.not.exist(err);
                data[2].columnName.should.equal("o['i']");
                data[2].dataType.should.equal("integer");
                data[3].columnName.should.equal("o['s']");
                data[3].dataType.should.equal("string");
                done(err);
            }
        );
    });
  });

  after(function (done) {
    dropTestTables(done);
  });
  function dropTestTables(done) {
    db = getDataSource();
    db.discoverModelDefinitions({}, function(err, data) {
      if (err) {
          done(err);
          return;
      }
      var dropCount = testTables.length;
      function dropped(err, data) {
          dropCount--;
          if (dropCount === 0) {
              done();
          }
      }
      testTables.forEach(function(tableName) {
          db.connector.query('DROP TABLE IF EXISTS ' + tableName, dropped);
      });
    });
  };
  
});
