var should = require('./init.js');

describe('crate.discover', function () {

    function dropAllTables(done) {
        db = getDataSource();
        db.discoverModelDefinitions({}, function(err, data) {
            if (err) {
                done(err);
                return;
            }
            var dropCount = data.length;
            function dropped(err, data) {
                dropCount--;
                if (dropCount === 0) {
                    done();
                }
            }
            if (dropCount > 0) {
                data.forEach(function(t) {
                    db.connector.query('DROP TABLE ' + t.name, dropped);
                });
            } else {
                done();
            }
        });
    }

    before(function (done) {
        dropAllTables(done);
    });

    it('should list no table if there is no table', function (done) {
        db = getDataSource();
        db.discoverModelDefinitions({}, function(err, data) {
            should.not.exist(err);
            data.should.have.lengthOf(0);
            done();
        });
    });

    it('should list all tables', function (done) {
        db = getDataSource();
        var T1 = db.define('T1', {t: {type: String}});
        var T2 = db.define('T2', {t: {type: String}});
        var T3 = db.define('T3', {t: {type: String}});
        db.automigrate(['T1', 'T2', 'T3'], function (err) {
            db.discoverModelDefinitions({}, function(err, data) {
                should.not.exist(err);
                data.should.have.lengthOf(3);
                data[0].name.should.equal('t1');
                data[1].name.should.equal('t2');
                data[2].name.should.equal('t3');
                done();
            });
        });
    });

    it('should list all columns of a table', function (done) {
        db = getDataSource();
        var T1 = db.define('T1', {t: {type: String}});
        db.automigrate(['T1'], function (err) {
            db.discoverModelProperties('t1', {}, function(err, data) {
                should.not.exist(err);
                data.should.have.lengthOf(2);
                data[0].columnName.should.equal('id');
                data[0].dataType.should.equal('string');
                data[0].type.should.equal('String');
                data[0].tableName.should.equal('t1');
                data[0].nullable.should.equal('Y');
                data[1].columnName.should.equal('t');
                data[1].dataType.should.equal('string');
                data[1].type.should.equal('String');
                data[1].tableName.should.equal('t1');
                data[1].nullable.should.equal('Y');
                done();
            });
        });
    });

    it('should list primary keys of a table', function (done) {
        db = getDataSource();
        var T1 = db.define('T1', {t: {type: String}});
        db.automigrate(['T1'], function (err) {
            db.discoverPrimaryKeys('t1', {}, function(err, data) {
                should.not.exist(err);
                data.should.have.lengthOf(1);
                data[0].tableName.should.equal('t1');
                data[0].pkName.should.equal('id');
                data[0].pkCols.should.have.lengthOf(1);
                data[0].pkCols[0].should.equal('id');
                done();
            });
        });
    });

    after(function (done) {
        dropAllTables(done);
    });

});

