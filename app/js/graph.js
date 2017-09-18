'use strict'

// convert a MM:SS string to a date object:
function parseTimeToDate (time){
	return new Date(2000, 0, 1, 12, time.split(":")[0], time.split(":")[1])
}

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
$.getJSON(url, (json, textStatus) => { // json is an array of objects
	const numberOfElements = json.length
	const firstDate = parseTimeToDate(d3.min(json, (d) => d.Time)),
	      lastDate  = parseTimeToDate(d3.max(json, (d) => d.Time))
	lastDate.setSeconds(lastDate.getSeconds() + 5) // add 5 seconds to the last time to place it away from the axis origin

	const margins = {top: 20, right: 20, bottom: 60, left: 120}
	const chartHeight = 600 - margins.top - margins.bottom
	const chartWidth = 1000 - margins.left - margins.right
	const barWidth = chartWidth / numberOfElements
	const formatTime = d3.timeFormat('%M:%S') // show only minutes and seconds

	// x scale (time, from highest to lowest):
	const x = d3.scaleTime().domain([lastDate, firstDate]).range([0, chartWidth])

	// y scale (Place ranking):
	const y = d3.scaleLinear().range([chartHeight, 0]) // because the origin is top-left, top will be chartHeight and bottom will be 0
	y.domain([d3.max(json, (d) => d.Place + 1), 1]) // set the scale to the specified array of numbers [lowestPlace, 1]

	// svg chart:
	const svgchart = d3.select('#svgchart') // select the svg element
										.attr("width", chartWidth + margins.left + margins.right) // set the width of the chart
										.attr("height", chartHeight + margins.top + margins.bottom) // set the height of the chart
										.append("g") // add this g to set left and top margins
    									.attr("transform", "translate(" + margins.left + "," + margins.top + ")")

  // tooltip div:
  const tooltip = d3.select('#mainContainer').append("div")
  									.classed("tooltip", true)
  									.style("opacity", 0) // start invisible

  // dots (cirle elements):
  const dot = svgchart.selectAll(".dot")
  	.data(json)
  .enter().append("circle")
  	.attr("r", 4) // circle radius
  	.attr("cx", (d) => x(parseTimeToDate(d.Time))) // circle x coord
    .attr("cy", (d) => y(d.Place)) // circle y coord
    .attr("class", (d) => d.Doping ? "doped" : "clean")
    .on("mouseover", function(d) {
    	d3.select(this).classed("overed", true) // add "overed" class to the rect
    	tooltip.transition()
    		.duration(300)
    		.style("opacity", 1) // show the tooltip
    	tooltip.html(d.Name + "<br>Time: " + d.Time +"<hr>")
       .style("left", (d3.event.pageX - d3.select('.tooltip').node().offsetWidth - 5) + "px")
       .style("top", (d3.event.pageY - d3.select('.tooltip').node().offsetHeight) + "px");
    })
    .on("mouseleave", function(d) {
    	d3.select(this).classed("overed", false)
    	tooltip.transition()
    		.duration(300)
    		.style("opacity", 0)
    	tooltip.html("")
    })

 //  bar.append("rect") // insert a rect in the g element
 //  		.attr("class", "bar")
 //  		.attr("y", (d) => y(d.Place)) // y coordinate of the rect (ex: if y height is 10px, y must be set to chartHeight-10)
	//     .attr("width", barWidth - 1) // width of the rect, leave 1px for bars' spacing
	//     .attr("height", (d) => chartHeight - y(d.Place)) // height of the rect
	//     .on("mouseover", function(d) { // DO NOT use arrow function in this case
	//     	d3.select(this).classed("overed", true) // add "overed" class to the rect
	//     	tooltip.transition()
	//     		.duration(300)
	//     		.style("opacity", 1) // show the tooltip
	//     	tooltip.html(formatTime(new Date(d.date)) + "<hr><span class='Place'>" + formatCurrency(d.Place) + " Billions</span>")
 //         .style("left", (d3.event.pageX - d3.select('.tooltip').node().offsetWidth - 5) + "px")
 //         .style("top", (d3.event.pageY - d3.select('.tooltip').node().offsetHeight) + "px");
	//     })
	//     .on("mouseout", function(d) {
	//     	d3.select(this).classed("overed", false)
	//     	tooltip.transition()
	//     		.duration(300)
	//     		.style("opacity", 0)
	//     	tooltip.html("")
	//     })

	//x axis line:
	const xAxis = svgchart.append('g')
									.classed("x-axis", true)
							    .attr("transform", "translate(0," + chartHeight + ")") // put the g on the bottom
							    .call(d3.axisBottom(x).tickFormat(formatTime)) // format ticks to show MM:SS only
  // x axis label:							    
	xAxis.append("text")
		.classed("axisLabel", true)
		.text("Time")
		.attr("dx", "20em") // x offset
		.attr("dy", "2.5em") // y offset
	xAxis.append("text")
		.classed("smallText", true)
		.text("[MM:SS]")
		.attr("dx", "40.5em")
		.attr("dy", "4.4em")
  xAxis.selectAll("text").style("text-anchor", "middle") // center x axis ticks' text
	
	//y axis line:
	const yAxis = svgchart.append('g')
									.classed("y-axis", true)
								 	.call(d3.axisLeft(y))
  // y axis label:
	yAxis.append("text")
 		.attr("id", "yAxisLabel")
 		.classed("axisLabel", true)
 		.text("Rank")
 		.attr("dx", "-13em") // x offset
 		.attr("dy", "-2.5em") // y offset
 		.attr("transform", "rotate(-90)") // rotate the label vertically
})
