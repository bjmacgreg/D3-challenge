// Create an SVG wrapper, append an SVG group that will hold the chart,
// and shift the latter by left and top margins.

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

var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial chart parameters
var chosenXAxis = "age";
var chosenYAxis = "smokes";
//__________________________________________________________________________________
// Functions to update X and Y axis scales upon click
function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width])
  return xLinearScale;
}

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);  
    return yLinearScale;  
  }
//__________________________________________________________________________________  
// Functions to update X and Y axes upon click
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }
//__________________________________________________________________________________
//Functions to update circle X and Y positions upon click
function renderCirclesOnXChange(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

function renderCirclesOnYChange(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}
//__________________________________________________________________________________
//Function to update tooltips upon click
function updateToolTipXY(chosenXAxis, chosenYAxis, circlesGroup) {

  //Get x label  
  if (chosenXAxis === "age") {
    var xlabel = "Age:";
  }
  else if (chosenXAxis === "income") {
    var xlabel = "Income:";
  }    
  else {
    var xlabel = "Poverty:";
  }

  //Get y label 
  if (chosenYAxis === "smokes") {
    var ylabel = "Smokers:";
  }
  else if (chosenYAxis === "obesity") {
    var ylabel = "Obesity:";
  }    
  else {
    var ylabel = "Healthcare:";
  }

  //Assign labels to tooltips and get values
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

    circlesGroup.call(toolTip);
    // onmoouseover event
    circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}
//__________________________________________________________________________________
//__________________________________________________________________________________
// Retrieve data from the CSV file and execute everything below
d3.csv("../assets/data/data.csv").then(function(data, err) {
  if (err) throw err;

  // parse data
  data.forEach(function(data) {
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.income = +data.income;
    data.obesity = +data.obesity; 
    data.healthcare = +data.healthcare;   
    data.poverty = +data.poverty;   
  });

  // xLinearScale function from csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // yLinearScale function from csv import
  var yLinearScale = yScale(data, chosenYAxis);
//__________________________________________________________________________________
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);
//__________________________________________________________________________________
  // append initial circles

  //Add MOE (as lines? shape?)
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "stateCircle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))    
    .attr("r", 20);
//__________________________________________________________________________________
  // Create group for three x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    .attr("class", "aText");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 18)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Average age");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 36)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Average income");

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 54)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("Percent in poverty");
//__________________________________________________________________________________
  //Create group for three y-axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("class", "aText");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 0.6*margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Percent smokers");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 0.8*margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Percent obese");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Healthcare (percent without insurance?)");
//__________________________________________________________________________________
  //X and Y event listeners
  // Functions updateToolTipXY, renderCirclesOnXChange, and renderCirclesOnYChange are defined above csv import
 
  var circlesGroup = updateToolTipXY(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // updates x axis
        chosenXAxis = value;
        xLinearScale = xScale(data, chosenXAxis);
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCirclesOnXChange(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTipXY(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }                        
          else {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);            
        }
      }
    });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // updates y axis
        yLinearScale = yScale(data, chosenYAxis);
        yAxis = renderYAxes(yLinearScale, yAxis);
        circlesGroup = renderCirclesOnYChange(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTipXY(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true); 
        }
        else if (chosenYAxis === "obesity") {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);         
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);                    
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});





