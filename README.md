## loopback-connector-crate

Please note that this package is in a very early state and is experimental.

`loopback-connector-crate` is the Crate connector module for [loopback-datasource-juggler](https://github.com/strongloop/loopback-datasource-juggler/).

It is derived from the mysql implementation at [loopback-connector-mysql](https://github.com/strongloop/loopback-connector-mysql)

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


## Testing

To run tests crate must be running.

Simplest way to install and run crate:

````sh
bash -c "$(curl -L try.crate.io)"
````
    
