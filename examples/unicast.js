/*
 * # start a discover node in unicast mode with no known others, listening on port 5555
 * terminal 1: node unicast.js --port=5555
 *
 * # start a discover node in unicast mode, listening on port 5556 and informing it of terminal 1's node:port
 * terminal 2: node unicast.js --port=5556 --address=127.0.0.1:5555
 *
 * # start a discover node in unicast mode, listening on port 5557 and informing it of a terminal 2's node:port
 * # this node's information will be propogated terminal 1 via terminal 2 because
 * # of the custom `unicast-nodes` pub/sub
 * terminal 3: node unicast.js --port=5557 --address=127.0.0.1:5556
 */

const argv = require("optimist").argv;
const { Discover } = require("../");
const port = argv.port;
const address = argv.address;
const unicast = [];

if (address) {
    unicast.push(address);
}

const d = new Discover({
	port: port
	, unicast: unicast,
});

d.on("added", node => {
    console.log("New node added to the network.");
    console.log(node);

    //make sure the address is in the destinations array
    const matches = d.broadcast.destinations.filter(destination => {
        return destination.address == node.address && destination.port == node.port;
    });

    if (!matches.length) {
        console.log("adding destination");

        d.broadcast.destinations.push({
            address: node.address
            , port: node.port,
        });

        //send all nodes that we know about to the network.
        d.broadcast.destinations.forEach(node => {
            d.send("unicast-nodes", node);
        });
    }
});

d.on("removed", node => {
    console.log("Node removed from the network.");
    console.log(node);

    //overwrite the desintation array excluding the removed node, yuck.
    d.broadcast.destination = d.broadcast.destinations.filter(destination => {
        return destinations.address !== node.address || destination.port !== node.port;
    });
});

d.join("unicast-nodes", node => {
    //make sure the address is in the destinations array
    const matches = d.broadcast.destinations.filter(destination => {
        return destination.address == node.address && destination.port == node.port;
    });

    if (!matches.length) {
        console.log("adding destination");

        d.broadcast.destinations.push({
            address: node.address
            , port: node.port,
        });
    }
});

d.on("error", err => {
    console.log("error", err);
});

d.on("promotion", function () {
    console.log("promoted");
});
