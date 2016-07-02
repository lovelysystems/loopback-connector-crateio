var should = require('./init.js');

var Post, PostWithUniqueTitle, PostWithCamelCaseColumn, db;
var testTables = ['PostWithDefaultId', 'PostWithUniqueTitle', 'PostWithCamelCaseColumn'];

describe('crate', function () {

  before(function (done) {
    db = getDataSource();

    Post = db.define('PostWithDefaultId', {
      title: { type: String, length: 255, index: true },
      content: { type: String },
      comments: [String],
      numbers: [Number],
      history: Object,
      stars: Number
    });

    PostWithUniqueTitle = db.define('PostWithUniqueTitle', {
      title: { type: String, index: {unique: true} },
      content: { type: String }
    });

    PostWithCamelCaseColumn = db.define('PostWithCamelCaseColumn', {
      titleCamelCase: { type: String},
      timeStamp: { type: Date, defaultFn: 'now'},
      content: { type: String }
    });

    db.automigrate(testTables, function (err) {
      should.not.exist(err);
      done(err);
    });
  });

  beforeEach(function (done) {
    var toDestroy = testTables.length;
    function destroyed() {
        toDestroy--;
        if (toDestroy <= 0) {
            done();
        }
    }
    Post.destroyAll(destroyed);
    PostWithUniqueTitle.destroyAll(destroyed);
    PostWithCamelCaseColumn.destroyAll(destroyed);
  });

  it('should allow array or object', function (done) {
    Post.create({title: 'a', content: 'AAA', comments: ['1', '2'],
      history: {a: 1, b: 'b'}}, function (err, post) {

      should.not.exist(err);

      Post.findById(post.id, function (err, p) {
        p.id.should.be.equal(post.id);

        p.content.should.be.equal(post.content);
        p.title.should.be.equal('a');
        p.comments.should.eql(['1', '2']);
        p.history.should.eql({a: 1, b: 'b'});

        done();
      });
    });

  });

  it('updateOrCreate should update the instance', function (done) {
    Post.create({title: 'a', content: 'AAA'}, function (err, post) {
      post.title = 'b';
      Post.updateOrCreate(post, function (err, p) {
        should.not.exist(err);
        p.id.should.be.equal(post.id);
        p.content.should.be.equal(post.content);

        Post.findById(post.id, function (err, p) {
          p.id.should.be.equal(post.id);

          p.content.should.be.equal(post.content);
          p.title.should.be.equal('b');

          done();
        });
      });

    });
  });

  it('updateOrCreate should update the instance without removing existing properties', function (done) {
    Post.create({title: 'a', content: 'AAA'}, function (err, post) {
      post = post.toObject();
      delete post.title;
      Post.updateOrCreate(post, function (err, p) {
        should.not.exist(err);
        p.id.should.be.equal(post.id);
        p.content.should.be.equal(post.content);
        Post.findById(post.id, function (err, p) {
          p.id.should.be.equal(post.id);

          p.content.should.be.equal(post.content);
          p.title.should.be.equal('a');

          done();
        });
      });

    });
  });

  it('updateOrCreate should create a new instance if it does not exist', function (done) {
    var post = {id: '123abc', title: 'a', content: 'AAA'};
    Post.updateOrCreate(post, function (err, p) {
      should.not.exist(err);
      p.title.should.be.equal(post.title);
      p.content.should.be.equal(post.content);
      p.id.should.be.equal(post.id);
      Post.findById(p.id, function (err, p) {
        p.id.should.be.equal(post.id);

        p.content.should.be.equal(post.content);
        p.title.should.be.equal(post.title);
        p.id.should.be.equal(post.id);

        done();
      });
    });

  });

  it('save should update the instance with the same id', function (done) {
    Post.create({title: 'a', content: 'AAA'}, function (err, post) {
      post.title = 'b';
      post.save(function (err, p) {
        should.not.exist(err);
        p.id.should.be.equal(post.id);
        p.content.should.be.equal(post.content);

        Post.findById(post.id, function (err, p) {
          p.id.should.be.equal(post.id);

          p.content.should.be.equal(post.content);
          p.title.should.be.equal('b');

          done();
        });
      });

    });
  });

  it('save should update the instance without removing existing properties', function (done) {
    Post.create({title: 'a', content: 'AAA'}, function (err, post) {
      delete post.title;
      post.save(function (err, p) {
        should.not.exist(err);
        p.id.should.be.equal(post.id);
        p.content.should.be.equal(post.content);

        Post.findById(post.id, function (err, p) {
          p.id.should.be.equal(post.id);

          p.content.should.be.equal(post.content);
          p.title.should.be.equal('a');

          done();
        });
      });

    });
  });

  it('save should create a new instance if it does not exist', function (done) {
    var post = new Post({id: '123abc', title: 'a', content: 'AAA'});
    post.save(function (err, p) {
      should.not.exist(err);
      p.title.should.be.equal(post.title);
      p.content.should.be.equal(post.content);
      p.id.should.be.equal(post.id);
      Post.findById(p.id, function (err, p) {
        should.not.exist(err);
        p.id.should.be.equal(post.id);

        p.content.should.be.equal(post.content);
        p.title.should.be.equal(post.title);
        p.id.should.be.equal(post.id);

        done();
      });
    });

  });

  it('all return should honor filter.fields', function (done) {
    var post = new Post({title: 'b', content: 'BBB'});
    post.save(function (err, post) {
      Post.all({fields: ['title'], where: {title: 'b'}}, function (err, posts) {
        should.not.exist(err);
        posts.should.have.lengthOf(1);
        post = posts[0];
        post.should.have.property('title', 'b');
        post.should.not.have.property('content');
        should.not.exist(post.id);

        done();
      });

    });
  });

  it('should allow to find using like', function (done) {
    Post.create({title: 'My Post', content: 'Hello'}, function (err, post) {
      Post.find({where: {title: {like: 'M%st'}}}, function (err, posts) {
        should.not.exist(err);
        posts.should.have.property('length', 1);
        done();
      });
    });
  });

  it('should support like for no match', function (done) {
    Post.create({title: 'My Post', content: 'Hello'}, function (err, post) {
      Post.find({where: {title: {like: 'M%XY'}}}, function (err, posts) {
        should.not.exist(err);
        posts.should.have.property('length', 0);
        done();
      });
    });
  });

  it('should allow to find using nlike', function (done) {
    Post.create({title: 'My Post', content: 'Hello'}, function (err, post) {
      Post.find({where: {title: {nlike: 'M%st'}}}, function (err, posts) {
        should.not.exist(err);
        posts.should.have.property('length', 0);
        done();
      });
    });
  });

  it('should support nlike for no match', function (done) {
    Post.create({title: 'My Post', content: 'Hello'}, function (err, post) {
      Post.find({where: {title: {nlike: 'M%XY'}}}, function (err, posts) {
        should.not.exist(err);
        posts.should.have.property('length', 1);
        done();
      });
    });
  });

  it('should support "and" operator that is satisfied', function (done) {
    Post.create({title: 'My Post', content: 'Hello'}, function (err, post) {
      Post.find({where: {and: [
        {title: 'My Post'},
        {content: 'Hello'}
      ]}}, function (err, posts) {
        should.not.exist(err);
        posts.should.have.property('length', 1);
        done();
      });
    });
  });

  it('should support "and" operator that is not satisfied', function (done) {
    Post.create({title: 'My Post', content: 'Hello'}, function (err, post) {
      Post.find({where: {and: [
        {title: 'My Post'},
        {content: 'Hello1'}
      ]}}, function (err, posts) {
        should.not.exist(err);
        posts.should.have.property('length', 0);
        done();
      });
    });
  });

  it('should support "or" that is satisfied', function (done) {
    Post.create({title: 'My Post', content: 'Hello'}, function (err, post) {
      Post.find({where: {or: [
        {title: 'My Post'},
        {content: 'Hello1'}
      ]}}, function (err, posts) {
        should.not.exist(err);
        posts.should.have.property('length', 1);
        done();
      });
    });
  });

  it('should support "or" operator that is not satisfied', function (done) {
    Post.create({title: 'My Post', content: 'Hello'}, function (err, post) {
      Post.find({where: {or: [
        {title: 'My Post1'},
        {content: 'Hello1'}
      ]}}, function (err, posts) {
        should.not.exist(err);
        posts.should.have.property('length', 0);
        done();
      });
    });
  });

  // The where object should be parsed by the connector
  it('should support where for count', function (done) {
    Post.create({title: 'My Post', content: 'Hello'}, function (err, post) {
      Post.count({and: [
        {title: 'My Post'},
        {content: 'Hello'}
      ]}, function (err, count) {
        should.not.exist(err);
        count.should.be.equal(1);
        Post.count({and: [
          {title: 'My Post1'},
          {content: 'Hello'}
        ]}, function (err, count) {
          should.not.exist(err);
          count.should.be.equal(0);
          done();
        });
      });
    });
  });

  // The where object should be parsed by the connector
  it('should support where for destroyAll', function (done) {
    Post.create({title: 'My Post1', content: 'Hello'}, function (err, post) {
      Post.create({title: 'My Post2', content: 'Hello'}, function (err, post) {
        Post.destroyAll({and: [
          {title: 'My Post1'},
          {content: 'Hello'}
        ]}, function (err) {
          should.not.exist(err);
          Post.count(function (err, count) {
            should.not.exist(err);
            count.should.be.equal(1);
            done();
          });
        });
      });
    });
  });

  it('should not allow SQL injection for inq operator', function (done) {
    Post.create({title: 'My Post1', content: 'Hello', stars: 5},
      function (err, post) {
        Post.create({title: 'My Post2', content: 'Hello', stars: 20},
          function (err, post) {
            Post.find({where: {title: {inq: ['(NULL); SELECT title from PostWithDefaultId;']}}},
              function (err, posts) {
                should.not.exist(err);
                posts.should.have.property('length', 0);
                done();
              });
          });
      });
  });

  it('should not allow SQL injection for lt operator', function (done) {
    Post.create({title: 'My Post1', content: 'Hello', stars: 5},
      function (err, post) {
        Post.create({title: 'My Post2', content: 'Hello', stars: 20},
          function (err, post) {
            Post.find({where: {stars: {lt: 'SELECT title from PostWithDefaultId'}}},
              function (err, posts) {
                should.not.exist(err);
                posts.should.have.property('length', 0);
                done();
              });
          });
      });
  });

  it('should not allow SQL injection for nin operator', function (done) {
    Post.create({title: 'My Post1', content: 'Hello', stars: 5},
      function (err, post) {
        Post.create({title: 'My Post2', content: 'Hello', stars: 20},
          function (err, post) {
            Post.find({where: {title: {nin: ['SELECT title from PostWithDefaultId']}}},
              function (err, posts) {
                should.not.exist(err);
                posts.should.have.property('length', 2);
                done();
              });
          });
      });
  });


  it('should not allow SQL injection for inq operator with number column', function (done) {
    Post.create({title: 'My Post1', content: 'Hello', stars: 5},
      function (err, post) {
        Post.create({title: 'My Post2', content: 'Hello', stars: 20},
          function (err, post) {
            Post.find({where: {stars: {inq: ['(NULL); DROP TABLE PostWithDefaultId;']}}},
              function (err, posts) {
                should.not.exist(err);
                // TODO: reactivate this check after crate issue #1802 is
                //       fixed
                //posts.should.have.property('length', 0);
                done();
              });
          });
      });
  });

  it('should not allow SQL injection for inq operator with array value', function (done) {
    Post.create({title: 'My Post1', content: 'Hello', stars: 5},
      function (err, post) {
        Post.create({title: 'My Post2', content: 'Hello', stars: 20},
          function (err, post) {
            Post.find({where: {stars: {inq: [5, '(NULL); DROP TABLE PostWithDefaultId;']}}},
              function (err, posts) {
                should.not.exist(err);
                // TODO: reactivate this check after crate issue #1802 is
                //       fixed
                //posts.should.have.property('length', 1);
                done();
              });
          });
      });
  });

  it('should not allow SQL injection for between operator', function (done) {
    Post.create({title: 'My Post1', content: 'Hello', stars: 5},
      function (err, post) {
        Post.create({title: 'My Post2', content: 'Hello', stars: 20},
          function (err, post) {
            Post.find({where: {stars: {between: [5, 'SELECT title from PostWithDefaultId']}}},
              function (err, posts) {
                should.not.exist(err);
                posts.should.have.property('length', 0);
                done();
              });
          });
      });
  });

  it('should allow camelCase table columns', function (done) {
    PostWithCamelCaseColumn.create({content: 'Hello'}, function (err, post) {
      PostWithCamelCaseColumn.findById(post.id, function (err, p) {
        should.not.exist(err);
        p.should.have.property('titleCamelCase');
        p.should.not.have.property('titlecamelcase');
        p.should.have.property('timeStamp');
        p.should.not.have.property('timestamp');
        done();
      });
    });
  });

  it('toFields should parse array and object fields', function (done) {
    var data = {
        "title":"a",
        "content":"AAA",
        "comments":["1","2","3"],
        "numbers": [1,2,3,4,5],
        "history": {a: 1, b: 'b'}
    };
    try {
      var r = db.connector.toFields('PostWithDefaultId', data);
      r.should.be.equal("\"title\" = 'a',\"content\" = 'AAA',\"comments\" = ['1','2','3'],\"numbers\" = [1,2,3,4,5],\"history\" = {\"a\"=1, \"b\"='b'}");
      done();
    } catch (err) {
      done(err);
    }
  });

  it('create should update the array fields', function (done) {
    Post.create({title: 'a', content: 'AAA', comments: ['1','2','3']}, function (err, post) {
      should.not.exist(err);
      Post.findById(post.id, function (err, p) {
        p.id.should.be.equal(post.id);
        p.comments.should.eql(['1','2','3']);
        done();
      });
    });
  });

  it('updateOrCreate should update the array fields', function (done) {
    Post.create({title: 'a', content: 'AAA'}, function (err, post) {
      post.comments = ['1','2','3'];
      Post.updateOrCreate(post, function (err, p) {
        should.not.exist(err);
        Post.findById(post.id, function (err, p) {
          p.id.should.be.equal(post.id);
          p.comments.should.eql(post.comments);
          done();
        });
      });
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
