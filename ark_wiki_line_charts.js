// ----------------------------
// LINE CHART CONFIG DEFINITION
// ----------------------------

class lineChartConfig {
	constructor(lcContainerDivID, lcDivID, lcWidth, lcHeight,
  	lcXAxisLabel, lcYAxisLabel, lcXAxisLabelIndent, lcYAxisLabelIndent) {
    // Set line chart container div ID.
    if (!(lcContainerDivID === undefined || lcContainerDivID === null) && 
    		typeof(lcContainerDivID) === 'string' && lcContainerDivID.length > 0) {
    	this.chartContainerID = lcContainerDivID;
    } else {
    	console.warn('Wrong ID provided for line chart container div (must be a non-empty string).');
    	this.chartContainerID = 'chartContainer'; // Default value.
    }
    
    // Set line chart div ID.
    if (!(lcDivID === undefined || lcDivID === null) && 
    		typeof(lcDivID) === 'string' && lcDivID.length > 0) {
    	this.chartDivID = lcDivID;
    } else {
    	console.warn('Wrong ID provided for line chart div (must be a non-empty string).');
    	this.chartDivID = 'chartElement'; // Default value.
    }
    
    // Set line chart width.
    if (!(lcWidth === undefined || lcWidth === null) && 
    		!isNaN(lcWidth) && parseInt(Number(lcWidth)) == lcWidth && !isNaN(parseInt(lcWidth, 10)) && lcWidth > 0) {
    	this.chartWidth = parseInt(lcWidth, 10);
    } else {
    	console.warn('Wrong width provided for line chart (must be a positive integer).');
    	this.chartWidth = 700; // Default value.
    }
    
    // Set line chart height.
    if (!(lcHeight === undefined || lcHeight === null) && 
    		!isNaN(lcHeight) && parseInt(Number(lcHeight)) == lcHeight && !isNaN(parseInt(lcHeight, 10)) && lcHeight > 0) {
    	this.chartHeight = parseInt(lcHeight, 10);
    } else {
    	console.warn('Wrong height provided for line chart (must be a positive integer).');
    	this.chartHeight = 300; // Default value.
    }

    // Set X axis label.
    if (!(lcXAxisLabel === undefined || lcXAxisLabel === null) && typeof(lcXAxisLabel) === 'string') {
    	this.xAxisLabel = lcXAxisLabel;
    } else {
    	console.warn('Wrong label provided for line chart X axis (must be a string).');
    	this.xAxisLabel = 'Time in seconds'; // Default value.
    }
    
    // Set Y axis label.
    if (!(lcYAxisLabel === undefined || lcYAxisLabel === null) && typeof(lcYAxisLabel) === 'string') {
    	this.yAxisLabel = lcYAxisLabel;
    } else {
    	console.warn('Wrong label provided for line chart Y axis (must be a string).');
    	this.yAxisLabel = 'Total food consumed'; // Default value.
    }
    
    // Set indentation for X axis label.
    if (!(lcXAxisLabelIndent === undefined || lcXAxisLabelIndent === null) &&
    		!(lcXAxisLabelIndent.x === undefined || lcXAxisLabelIndent.x === null) &&
        !(lcXAxisLabelIndent.y === undefined || lcXAxisLabelIndent.y === null)) {
    	this.xAxisLabelIndent = lcXAxisLabelIndent;
    } else {
    	console.warn('Wrong indentation provided for line chart X axis label (must be an object containing 2 integer values "x" and "y").');
    	this.xAxisLabelIndent = { x: 0, y: 32 }; // Default value.
    }
    
    // Set indentation for Y axis label.
    if (!(lcYAxisLabelIndent === undefined || lcYAxisLabelIndent === null) &&
    		!(lcYAxisLabelIndent.x === undefined || lcYAxisLabelIndent.x === null) &&
        !(lcYAxisLabelIndent.y === undefined || lcYAxisLabelIndent.y === null)) {
    	this.yAxisLabelIndent = lcYAxisLabelIndent;
    } else {
    	console.warn('Wrong indentation provided for line chart Y axis label (must be an object containing 2 integer values "x" and "y").');
    	this.yAxisLabelIndent = { x: -25, y: -65 }; // Default value.
    }

    this.chartDataset = []; // This will hold the chart data.
    this.maxValX = 0; // This will hold the max X value from the chart data.
    this.maxValY = 0; // This will hold the max Y value from the chart data.
  }
}

// --------------------
// LINE CHART NAMESPACE
// --------------------
var lineChartNamespace = {
  // Function rendering the chart (will redraw it if already present).
  renderLineChart : function (lineChartConfig, drawTooltipsFunc, computeChartDataFunc) {
    var containerDiv = $('#' + lineChartConfig.chartContainerID);
    var chartDiv = $('#' + lineChartConfig.chartDivID);
    if (!(containerDiv === undefined || containerDiv === null) &&
        !(chartDiv === undefined || chartDiv === null)) {
        computeChartDataFunc(lineChartConfig);
        // Remove previously drawed chart.
        d3.select('#' + lineChartConfig.chartDivID).remove();
        // Add a fresh chart element.
        var e = $('<div></div>');
        containerDiv.append(e);
        e.attr('id', lineChartConfig.chartDivID);
        // Draw the chart element.
        lineChartNamespace.drawLineChart(lineChartConfig, drawTooltipsFunc);
    }
  },

  // Function drawing the chart.
  drawLineChart : function (lineChartConfig, drawTooltipsFunc) {
    // Store a pointer to the draw tooltips function.
    var	drawTooltipsFuncPtr = drawTooltipsFunc;

    // Define margins using convention practice.
    var margin = {top: 50, right: 50, bottom: 50, left: 70}, width = lineChartConfig.chartWidth - margin.left - margin.right, height = lineChartConfig.chartHeight - margin.top - margin.bottom;

    // Define scalings.
    var xScale = d3.scaleLinear()
      .domain([0, lineChartConfig.maxValX]) // input
      .range([0, width]); // output

    var yScale = d3.scaleLinear()
      .domain([0, lineChartConfig.maxValY]) // input 
      .range([height, 0]); // output

    // d3's line generator.
    var line = d3.line()
      .x(function(d) { return xScale(d.x); }) // Set x values for line generator.
      .y(function(d) { return yScale(d.y); }) // Set y values for line generator.
      .curve(d3.curveMonotoneX) // Apply smoothing to the line.

    // Add the SVG to the page.
    var svg = d3.select('#' +  lineChartConfig.chartDivID)
      .append("svg")
      .attr('class','chart-graph')
      .attr("viewBox", "0 0 " + lineChartConfig.chartWidth + " " + lineChartConfig.chartHeight)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .on("mousemove", mousemove)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Call the x axis in a group tag.
    var xAxis = svg.append("g")
      .attr("class", "chart-x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom.

    // Call the y axis in a group tag.
    var yAxis = svg.append("g")
      .attr("class", "chart-y-axis")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft.

    // Append the path, bind the data, and call the line generator.
    svg.append("path")
        .datum(lineChartConfig.chartDataset) // Binds data to the line.
        .attr("class", "chart-line") // Assign a class for styling.
        .attr("d", line); // Calls the line generator. 

    // Add X axis label.
    svg.append("text")
        .attr("class", "x label chart-x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", (width / 2) + lineChartConfig.xAxisLabelIndent.x)
        .attr("y", height + lineChartConfig.xAxisLabelIndent.y)
        .text(lineChartConfig.xAxisLabel);

    // Add Y axis label.
    svg.append("text")
        .attr("class", "y label chart-y-axis-label")
        .attr("text-anchor", "end")
        .attr("x", lineChartConfig.yAxisLabelIndent.x)
        .attr("y", lineChartConfig.yAxisLabelIndent.y)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(lineChartConfig.yAxisLabel);

    // Function handling mouse move event.
    function mousemove()
    {
      // Find closest line point to mouse cursor.
      let x = d3.mouse(this)[0] - margin.left;
      let closest = lineChartConfig.chartDataset.reduce((best, value, i) => 
        {
          let absx = Math.abs(xScale(value.x) - x) 
          if(absx < best.value) {
            return {index: i, value:absx};
          }
          else {
            return best;
          }
        }, {index:0, value:Number.MAX_SAFE_INTEGER});
      // Remove previous annotations.
      d3.selectAll('.chart-annot').remove();
      // Draw X and Y lines at mouse position.
      drawLinesAtMousePos(lineChartConfig.chartDataset[closest.index]);
      // Draw tooltips at mouse position.
      drawTooltipsFuncPtr(lineChartConfig, lineChartConfig.chartDataset[closest.index]);
    }

    // Function drawing X and Y lines on mouse move.
    function drawLinesAtMousePos(d) {
      // Draw current X line.
      svg.append('line')
        .attr('class','chart-annot chart-current-x-line')
        .attr("x1", xScale(d.x))
        .attr("y1", yScale(d.y))
        .attr("x2", xScale(d.x))
        .attr("y2", height);
      // Draw current Y line.
      svg.append('line')
        .attr('class','chart-annot chart-current-y-line')
        .attr("x1", 0)
        .attr("y1", yScale(d.y))
        .attr("x2", xScale(d.x))
        .attr("y2", yScale(d.y));
    }
  }
};

// -----------------------
// DAEODON CHART NAMESPACE
// -----------------------

var daeodonChartNamespace = {
	// Function to generate Daeodon's rate chart data.
  computeDaeodonRateChartData : function (lineChartConfig) {
    lineChartConfig.maxValX = 101000;
    lineChartConfig.maxValY = 450;
    lineChartConfig.chartDataset = [];
  	for (var i = 0; i <= 100000; i += 500) {
    	var healRate = (i / 100) * 0.5;
      if (healRate < 20) {
      	healRate = 20;
      }
      if (healRate > 400) {
      	healRate = 400;
      }
      lineChartConfig.chartDataset.push({x:i,y:healRate});
    }
  },

  // Function to draw Daeodon's rate chart tooltip.
  drawDaeodonRateChartTooltip : function (lineChartConfig, d) {
    d3.select('#' + lineChartConfig.chartDivID).append("div")
      .attr('class', 'chart-annot')
      .style("position", "absolute")
      .style("visibility", "visible")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("top", event.pageY + 'px')
      .style("left", (event.pageX > (lineChartConfig.chartWidth - 110) ? (event.pageX - 120) : (event.pageX + 10)) + 'px')
      .style("padding", "4px")
      .html('<div class="chart-tooltip-div">' + d.x + ' max HP<br/>' + d.y + ' HP/sec</div>');
  },

  // Function to bind input values to Daeodon food chart.
  bindInputsToDaeodonFoodChart : function (lineChartConfig) {
    var containerDiv = $('#' + lineChartConfig.chartContainerID);
    var chartDiv = $('#' + lineChartConfig.chartDivID);
    var dinoamountBtn = $('#dinoAmount');
    var healrateBtn = $('#healingRate');
    if (!(containerDiv === undefined || containerDiv === null) &&
        !(chartDiv === undefined || chartDiv === null) &&
        !(dinoamountBtn === undefined || dinoamountBtn === null) &&
        !(healrateBtn === undefined || healrateBtn === null)) {
        dinoamountBtn.unbind('input');
        dinoamountBtn.on('input', function() {
          lineChartNamespace.renderLineChart(lineChartConfig,
      	    daeodonChartNamespace.drawDaeodonFoodChartTooltip,
            daeodonChartNamespace.computeDaeodonFoodChartData);
        });

        healrateBtn.unbind('input');
        healrateBtn.on('input', function() {
          lineChartNamespace.renderLineChart(lineChartConfig,
      	    daeodonChartNamespace.drawDaeodonFoodChartTooltip,
            daeodonChartNamespace.computeDaeodonFoodChartData);
        });
    }
  },

  // Function to generate Daeodon's food chart data.
  computeDaeodonFoodChartData : function (lineChartConfig) {
    var dinoAmount = parseInt($('#dinoAmount').val());
    var healingRate = parseFloat($('#healingRate').val()) * dinoAmount;
    lineChartConfig.maxValX = 300;
    lineChartConfig.maxValY = 0;
    lineChartConfig.chartDataset = [];
    for (var i = 0; i <= lineChartConfig.maxValX; i++) {
      var baseFoodConsumption = 100 + (i * 40);
      var healFoodConsumption = (i * healingRate);
      var totalFoodConsumption = baseFoodConsumption + healFoodConsumption;
      lineChartConfig.chartDataset.push({x:i,y:totalFoodConsumption});
      if (i === lineChartConfig.maxValX) {
        lineChartConfig.maxValY = totalFoodConsumption;
      }
    }
  },

  // Function to draw Daeodon's food chart tooltip.
  drawDaeodonFoodChartTooltip : function (lineChartConfig, d) {
    var nbDino = $('#dinoAmount').val();
    var totalHealed = (d.x * $('#healingRate').val() * nbDino);
    var healedPerDino = (totalHealed / nbDino);

    d3.select('#' + lineChartConfig.chartDivID).append("div")
      .attr('class', 'chart-annot')
      .style("position", "absolute")
      .style("visibility", "visible")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("top", event.pageY + 'px')
      .style("left", (event.pageX > (lineChartConfig.chartWidth - 160) ? (event.pageX - 180) : (event.pageX + 10)) + 'px')
      .style("padding", "4px")
      .html('<div class="chart-tooltip-div">' + d.x + ' seconds<br/>' + d.y + ' food consumed<br/>' + totalHealed + ' total HP healed<br/>' + healedPerDino + ' HP healed/dino</div>');
  }
};

// --------------------
// GENERATE LINE CHARTS
// --------------------

$( document ).ready(function() {
    // Configure Daeodon healing rate chart.
    var daeodonRateChartConfig = new lineChartConfig('daeodonRateChartContainer', 'daeodonRateChartElement', 700, 300,
                                                     'Healed dino max HP', 'Healing rate (HP/sec)', { x: 0, y: 32 }, { x: -25, y: -65 });
	// Draw Daeodon healing rate chart.
    lineChartNamespace.renderLineChart(daeodonRateChartConfig,
                                       daeodonChartNamespace.drawDaeodonRateChartTooltip,
                                       daeodonChartNamespace.computeDaeodonRateChartData);

    // Configure Daeodon food chart.
    var daeodonFoodChartConfig = new lineChartConfig('daeodonFoodChartContainer', 'daeodonFoodChartElement', 700, 300,
                                                     'Time in seconds', 'Total food consumed', { x: 0, y: 32 }, { x: -25, y: -65 });
    // Bind inputs to Daeodon food chart.
    daeodonChartNamespace.bindInputsToDaeodonFoodChart(daeodonFoodChartConfig);
    // Draw Daeodon food chart.
    lineChartNamespace.renderLineChart(daeodonFoodChartConfig,
                                       daeodonChartNamespace.drawDaeodonFoodChartTooltip,
                                       daeodonChartNamespace.computeDaeodonFoodChartData);
});
