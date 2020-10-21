node-discover
=============
[![npm version](https://badge.fury.io/js/node-discover.svg)](https://www.npmjs.com/package/node-discover)

Automatic and decentralized discovery and monitoring of nodejs instances with built in support for a variable number of
master processes, service advertising and channel messaging.

Why?
====

So, you have a whole bunch of node processes running but you have no way within each process to determine where the
other processes are or what they can do. This module aims to make discovery of new processes as simple as possible.
Additionally, what if you want one process to be in charge of a cluster of processes? This module also has automatic
master process selection.

Compatibility
=============

This module uses broadcast and multicast features from node's dgram module. All required features of the dgram module
are implemented in the following versions of node

	- v0.4.x
	- v0.6.9+

Example
=======

Be sure to look in the examples folder, especially at
the [distributed event emitter](https://github.com/wankdanker/node-discover/blob/master/examples/deventemitter.js)

```js
const { Discover } = require('node-discover');

const d = new Discover();

d.on("promotion", function () {
    /* 
        * Launch things this master process should do.
        * 
        * For example:
        *	- Monitior your redis servers and handle failover by issuing slaveof
        *    commands then notify other node instances to use the new master
        *	- Make sure there are a certain number of nodes in the cluster and 
        *    launch new ones if there are not enough
        *	- whatever
        * 
        */

    console.log("I was promoted to a master.");
});

d.on("demotion", function () {
    /*
        * End all master specific functions or whatever you might like. 
        *
        */

    console.log("I was demoted from being a master.");
});

d.on("added", function (obj) {
    console.log("A new node has been added.");
});

d.on("removed", function (obj) {
    console.log("A node has been removed.");
});

d.on("master", function (obj) {
    /*
        * A new master process has been selected
        * 
        * Things we might want to do:
        * 	- Review what the new master is advertising use its services
        *	- Kill all connections to the old master
        */

    console.log("A new master is in control");
});
```

Installing
==========

### npm

```shell
npm install node-discover
```

### git

```shell
git clone git://github.com/wankdanker/node-discover.git
```

TODO
====

I have not tested large packets. The current version does not handle recombining split messages.


LICENSE
=======

(MIT License)

Copyright (c) 2011 Dan VerWeire dverweire@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
