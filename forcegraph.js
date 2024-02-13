
import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";

function _1(md)
{
    return ''
}
    
function _chart(d3,data,invalidation)
{
    // Specify the dimensions of the chart.
    const width = 928;
    const height = 600;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = data.links.map(d => ({...d}));
    const nodes = data.nodes.map(d => ({...d}));

    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Add a line for each link, and a circle for each node.
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll()
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll()
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        //.attr("fill", d => color(d.group));
        .attr("fill", d => setColor(d.group));
    node.append("title")
        .text(d => d.id);

    function setColor(group)
    {
        if(group <= 1) { return "#3BE1F0"}
        if(group === 2){ return "#6F8BF4"}
        if(group === 3){ return "#FFA13A"}
        if(group === 4){ return "#9E40BF"}
        if(group >= 5) { return "#6746D6"}
    }

    // Add a drag behavior.
    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked()
    {
        link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

        node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) 
    {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event)
    {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event)
    {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    // When this cell is re-run, stop the previous simulation. (This doesn’t
    // really matter since the target alpha is zero and the simulation will
    // stop naturally, but it’s a good practice.)
    invalidation.then(() => simulation.stop());

    return svg.node();
}


function _data(FileAttachment){
    return(FileAttachment("miserables.json").json())
}

export default function define(runtime, observer)
{
    const main = runtime.module();
    const fileAttachments = new Map([
        ["miserables.json", {url: "https://static.observableusercontent.com/files/31d904f6e21d42d4963ece9c8cc4fbd75efcbdc404bf511bc79906f0a1be68b5a01e935f65123670ed04e35ca8cae3c2b943f82bf8db49c5a67c85cbb58db052", mimeType: "application/json"}]
    ]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    main.variable(observer()).define(["md"], _1);
    main.variable(observer("chart")).define("chart", ["d3","data","invalidation"], _chart);
    main.variable(observer("data")).define("data", ["FileAttachment"], _data);
    return main;
}

new Runtime().module(define, Inspector.into("#forcegraph-container"));