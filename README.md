## loopback-connector-crateio

Please note that this package is in a very early state and is experimental.

`loopback-connector-crate` is the Crate connector module for [loopback-datasource-juggler](https://github.com/strongloop/loopback-datasource-juggler/).

It is derived from the mysql implementation at [loopback-connector-mysql](https://github.com/strongloop/loopback-connector-mysql)

## Installation

```sh
npm install loopback-connector-crateio --save
```

## Basic use

To use it you need `loopback-datasource-juggler`.

1. Setup dependencies in `package.json`:

```json
{
  ...
  "dependencies": {
    "loopback-datasource-juggler": "latest",
    "loopback-connector-crateio": "latest"
  },
  ...
}
```

2. Use:

```javascript
var DataSource = require('loopback-datasource-juggler').DataSource;
var dataSource = new DataSource('crateio', {
  host: 'localhost',
  port: 4200
});
```

## Crate Features

Models can be defined with object properties:

```javascript
var ModelWithSchemaObject = db.define('ModelWithSchemaObject', {
  o: {
    type: Object,
    policy: 'STRICT',
    schema: 'ObjectModel'
  }
});
```

## Limitations

alterTable can only add/create new properties.

It is not possible to create indices.

## Testing

To run tests a instance crate must be running on port 4200.

Simplest way to install and run crate:

```sh
bash -c "$(curl -L try.crate.io)"
```
