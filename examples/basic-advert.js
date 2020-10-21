/*
 *
 *
 */

const { Discover } = require("../");

const d = new Discover();

d.advertise({
    http: "80",
    random: Math.random(),
});

d.on("added", obj => {
    console.log("New node added to the network.");
    console.log(obj);
});

d.on("removed", obj => {
    console.log("Node removed from the network.");
    console.log(obj);
});
