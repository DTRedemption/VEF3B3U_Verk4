// variables
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [0.3, 7];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const HOVER_COLOR = "#d36f80"

// events for zooming
const zoom = d3
  .zoom()
  .scaleExtent(ZOOM_THRESHOLD)
  .on("zoom", zoomHandler);

function zoomHandler() {
  g.attr("transform", d3.event.transform);
}

function clickToZoom(zoomStep) {
  svg
    .transition()
    .duration(ZOOM_DURATION)
    .call(zoom.scaleBy, zoomStep);
}

d3.select("#btn-zoom--in").on("click", () => clickToZoom(ZOOM_IN_STEP));
d3.select("#btn-zoom--out").on("click", () => clickToZoom(ZOOM_OUT_STEP));

// make svg container and transparent rectangle to facilitate zooming.
const svg = d3
  .select("#map-container")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%");
// create Div that will fade in with info about the region when clicked.
  var hoverDiv = d3.select("body").append("div")	
  .attr("id", "tooltip")				
  .style("opacity", 0);
  
const g = svg.call(zoom).append("g");

g
  .append("rect")
  .attr("width", WIDTH * OVERLAY_MULTIPLIER)
  .attr("height", HEIGHT * OVERLAY_MULTIPLIER)
  .attr(
    "transform",
    `translate(-${WIDTH * OVERLAY_OFFSET},-${HEIGHT * OVERLAY_OFFSET})`
  )
  .style("fill", "none")
  .style("pointer-events", "all");

//create projection
const projection = d3
  .geoMercator()

//create svg path, set colors
const path = d3.geoPath().projection(projection);
const color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));

// render the map with iceland.js data
renderMap(iceland);

function renderMap(root) {
  //draw the regions and create event listeners

  projection
  .scale(1)
  .translate([0, 0]);

  //function for centering on the map on load.
  var b = path.bounds(root),
  s = .95 / Math.max((b[1][0] - b[0][0]) / WIDTH, (b[1][1] - b[0][1]) / HEIGHT),
  t = [(WIDTH - s * (b[1][0] + b[0][0])) / 2, (HEIGHT - s * (b[1][1] + b[0][1])) / 2];

  projection
  .scale(s)
  .translate(t);

  // generate map, add info for the regions to the hover DIV to display when clicked on.
  g
    .append("g")
    .selectAll("path")
    .data(root.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "#FFF")
    .attr("stroke-width", 0.5)
    .on("click", function(d) {
      d3.select(this).attr("fill", HOVER_COLOR)		
      hoverDiv.transition()		
          .duration(200)		
          .style("opacity", .9);		
      hoverDiv	.html("Name: " + d.properties.Name + "<br/>" + "Population: " + d.properties.Population)	
          .style("left", (d3.event.pageX) + "px")		
          .style("top", (d3.event.pageY - 28) + "px");	
      })					
  .on("mouseout", function(d, i) {
      d3.select(this).attr("fill", color(i))
      hoverDiv.transition()		
          .duration(500)		
          .style("opacity", 0);	
  });

  // add labels to the regions
  g
    .append("g")
    .selectAll("text")
    .data(root.features)
    .enter()
    .append("text")
    .attr("transform", d => `translate(${path.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", 20)
    .attr("dx", d => _.get(d, "offset[0]", null))
    .attr("dy", d => _.get(d, "offset[1]", null))
    .text(d => d.properties.Name);
}
