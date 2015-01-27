## loopback-connector-crate

`loopback-connector-crate` is the Crate connector module for [loopback-datasource-juggler](https://github.com/strongloop/loopback-datasource-juggler/).

## Installation

````sh
npm install loopback-connector-crate --save
````

## Basic use

To use it you need `loopback-datasource-juggler`.

1. Setup dependencies in `package.json`:

    ```json
    {
      ...
      "dependencies": {
        "loopback-datasource-juggler": "latest",
        "loopback-connector-crate": "latest"
      },
      ...
    }
    ```

2. Use:

    ```javascript
        var DataSource = require('loopback-datasource-juggler').DataSource;
        var dataSource = new DataSource('crate', {
            host: 'localhost',
            port: 4200
        });
    ```

