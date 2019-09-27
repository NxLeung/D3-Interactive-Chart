var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

let chosenXAxis = "poverty";
let chosenYAxis = "obesity";

function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(stateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, d => d[chosenYAxis]) * 0.8,
      d3.max(stateData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;
}

function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis
    .transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis
    .transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

function renderCircles(
  circlesGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function updateCircleLabels(
  circleLabels,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circleLabels
    .transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]) + 5);

  return circleLabels;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty: ";
    var xlabelend = "%";
  } else if (chosenXAxis === "age") {
    var xlabel = "Age: ";
    var xlabelend = "";
  } else {
    var xlabel = "HHI: ";
    var xlabelend = "";
  }

  if (chosenYAxis === "obesity") {
    var ylabel = "Obesity: ";
  } else if (chosenXAxis === "smokes") {
    var ylabel = "Smokes: ";
  } else {
    var ylabel = "Healthcare: ";
  }

  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return `${d.state}<br>${xlabel} ${d[chosenXAxis]}${xlabelend}<br>${ylabel} ${d[chosenYAxis]}%`;
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", function(data) {
      toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Import Data
d3.csv("./assets/data/data.csv").then(function(stateData) {
  // Step 1: Parse Data/Cast as numbers
  // ==============================
  stateData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // Step 2: Create scale functions
  // ==============================
  let xLinearScale = xScale(stateData, chosenXAxis);
  let yLinearScale = yScale(stateData, chosenYAxis);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g").call(leftAxis);

  var circlesGroup = chartGroup
    .selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "15")
    .attr("class", "stateCircle");

  var circleLabels = chartGroup
    .selectAll(".stateText")
    .data(stateData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 5)
    .attr("class", "stateText")
    .text(d => d.abbr);

  var xlabelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  var ylabelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(-${margin.left},${height / 2})rotate(-90)`);

  var obesityLabel = ylabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");

  var smokesLabel = ylabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var healthcareLabel = ylabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text").on("click", function() {
    // get value of selection
    var xValue = d3.select(this).attr("value");
    if (xValue !== chosenXAxis) {
      // replaces chosenXAxis with value
      chosenXAxis = xValue;

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(stateData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxis(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(
        circlesGroup,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      circleLabels = updateCircleLabels(
        circleLabels,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      //   circleLabels = updateCircleLabels(
      //     circlesGroup,
      //     xLinearScale,
      //     chosenXAxis,
      //     yLinearScale,
      //     chosenYAxis,
      //     circleLabels
      //   );

      // changes classes to change bold text
      if (chosenXAxis === "poverty") {
        povertyLabel.classed("active", true).classed("inactive", false);
        ageLabel.classed("active", false).classed("inactive", true);
        incomeLabel.classed("active", false).classed("inactive", true);
      } else if (chosenXAxis === "age") {
        povertyLabel.classed("active", false).classed("inactive", true);
        ageLabel.classed("active", true).classed("inactive", false);
        incomeLabel.classed("active", false).classed("inactive", true);
      } else {
        povertyLabel.classed("active", false).classed("inactive", true);
        ageLabel.classed("active", false).classed("inactive", true);
        incomeLabel.classed("active", true).classed("inactive", false);
      }
    }
  });

  // y axis labels event listener
  ylabelsGroup.selectAll("text").on("click", function() {
    // get value of selection
    var yValue = d3.select(this).attr("value");
    if (yValue !== chosenYAxis) {
      // replaces chosenYAxis with value
      chosenYAxis = yValue;

      // functions here found above csv import
      // updates y scale for new data
      yLinearScale = yScale(stateData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxis(yLinearScale, yAxis);

      // updates circles with new y values
      circlesGroup = renderCircles(
        circlesGroup,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      circleLabels = updateCircleLabels(
        circleLabels,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "obesity") {
        obesityLabel.classed("active", true).classed("inactive", false);
        smokesLabel.classed("active", false).classed("inactive", true);
        healthcareLabel.classed("active", false).classed("inactive", true);
      } else if (chosenYAxis === "smokes") {
        obesityLabel.classed("active", false).classed("inactive", true);
        smokesLabel.classed("active", true).classed("inactive", false);
        healthcareLabel.classed("active", false).classed("inactive", true);
      } else {
        obesityLabel.classed("active", false).classed("inactive", true);
        smokesLabel.classed("active", false).classed("inactive", true);
        healthcareLabel.classed("active", true).classed("inactive", false);
      }
    }
  });
});
