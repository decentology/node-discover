/*
 * This is the most basic example of using Discover.
 *
 * In this example all we are interested in is when new nodes are added to the
 * network or when they are removed. The master selection stuff happens behind
 * the scenes but we can completely ignore it and just handle the events for
 * new nodes added or removed from the network.
 *
 */

const { Discover } = require("../");

const d = new Discover({ key: process.argv[2] });

d.on("added", obj => {
	console.log("New node added to the network.");
	console.log(obj);
});

d.on("removed", obj => {
	console.log("Node removed from the network.");
	console.log(obj);
});

d.on("error", err => {
	console.log("error", err);
});
