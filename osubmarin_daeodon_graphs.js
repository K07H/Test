/* ---------------------- */
/*  LINE GRAPH NAMESPACE  */
/* ---------------------- */

var lineGraphNamespace = {
  // Object storing graph style.
  graphStyle : function (axisColorHex, axisLabelsFont, axisLabelsColorHex,
                         axisTitlesFont, axisTitlesColorHex,
                         lineColorHex, tooltipTextFont, tooltipTextColorHex) {
    this.axisColor = axisColorHex;
    this.axisFont = axisLabelsFont;
    this.axisFontColor = axisLabelsColorHex;
    this.axisTitleFont = axisTitlesFont;
    this.axisTitleColor = axisTitlesColorHex;
    this.lineColor = lineColorHex;
    this.tooltipFont = tooltipTextFont;
    this.tooltipFontColor = tooltipTextColorHex;
  },

  // Object storing graph dimensions' adjusments.
  graphDimensions : function (xAxisPadding, yAxisPadding,
                              xAxisMarginRight, yAxisMarginTop,
                              xAxisTitleMarginLeft, xAxisTitleMarginBottom,
                              yAxisTitleMarginLeft, yAxisTitleMarginBottom) {
    this.xPadding = xAxisPadding;
    this.yPadding = yAxisPadding;
    this.xMarginRight = xAxisMarginRight;
    this.yMarginTop = yAxisMarginTop;
    this.xTitleMarginLeft = xAxisTitleMarginLeft;
    this.xTitleMarginBottom = xAxisTitleMarginBottom;
    this.yTitleMarginLeft = yAxisTitleMarginLeft;
    this.yTitleMarginBottom = yAxisTitleMarginBottom;
  },

  // Object storing graph configuration.
  graphConfig : function (graphCanvasID, tipCanvasID, graphData, drawTooltipFuncPtr,
                          xAxisModulo, yAxisModulo, xAxisTitle, yAxisTitle,
                          dimensions, styles) {
    this.graphJquery = $('#' + graphCanvasID);
    this.graph = document.getElementById(graphCanvasID);
    this.tipJquery = $('#' + tipCanvasID);
    this.tipCanvas = document.getElementById(tipCanvasID);
    this.ctx = this.graph.getContext('2d');
    this.tipCtx = this.tipCanvas.getContext('2d');

    this.canvasOffset = this.graphJquery.offset();
    this.offsetX = this.canvasOffset.left;
    this.offsetY = this.canvasOffset.top;

    this.xModulo = xAxisModulo;
    this.yModulo = yAxisModulo;
    
    this.xTitle = xAxisTitle;
    this.yTitle = yAxisTitle;

    this.graphDimensions = dimensions;
    this.graphStyle = styles;

    this.drawTooltipFunc = drawTooltipFuncPtr;

    this.data = graphData;
    this.dots = null;
    this.healingRateInputID = '';
    this.dinoAmountInputID = '';
  },

  // Refreshes objects from config (needed when redrawing the graph).
  refreshGraphConfig : function(config, graphCanvasID, tipCanvasID) {
    config.graphJquery = $('#' + graphCanvasID);
    config.graph = document.getElementById(graphCanvasID);
    config.tipJquery = $('#' + tipCanvasID);
    config.tipCanvas = document.getElementById(tipCanvasID);
    config.ctx = config.graph.getContext('2d');
    config.tipCtx = config.tipCanvas.getContext('2d');

    config.canvasOffset = config.graphJquery.offset();
    config.offsetX = config.canvasOffset.left;
    config.offsetY = config.canvasOffset.top;
  },

  doHideTooltip : function (e, config) {
    var mouseX = parseInt(e.clientX - config.offsetX);
    var mouseY = parseInt(e.clientY - config.offsetY);

    var minX = config.graphJquery.offset().left - config.offsetX;
    var maxX = minX + config.graphJquery.width() - config.offsetX;
    var minY = config.graphJquery.offset().top - config.offsetY;
    var maxY = minY + config.graphJquery.height() - config.offsetY;

    if (mouseX <= minX || mouseX >= maxX || mouseY <= minY || mouseY >= maxY) {
      config.tipCanvas.style.display = 'none';
      config.tipCanvas.style.left = '-4000px';
    }
  },

  // Function drawing the line graph.
  drawGraph : function (config) {
    'use strict';

    // Associate a dot to each data value.
    config.dots = [];
    for (var i = 0; i < config.data.length; i++) {
      config.dots.push({
        x: lineGraphNamespace.getXPixel(config, config.data[i].X),
        y: lineGraphNamespace.getYPixel(config, config.data[i].Y),
        valX: config.data[i].X,
        valY: config.data[i].Y
      });
    }

    // Bind mouse move event.
    config.graphJquery.mousemove(function (e) {
      config.drawTooltipFunc(e, config);
    });

    // Hide tooltip when mouse leaves graph.
    config.graphJquery.mouseout(function (e) {
      lineGraphNamespace.doHideTooltip(e, config);
    });
    
    // Hide tooltip when mouse leaves tooltip.
    config.tipJquery.mouseout(function (e) {
      lineGraphNamespace.doHideTooltip(e, config);
    });

    // Set axises style.
    config.ctx.lineWidth = 2;
    config.ctx.strokeStyle = config.graphStyle.axisColor;
    config.ctx.font = config.graphStyle.axisFont;
    config.ctx.textAlign = 'center';

    // Draw the axises.
    config.ctx.beginPath();
    config.ctx.moveTo(config.graphDimensions.xPadding, 0);
    config.ctx.lineTo(config.graphDimensions.xPadding, config.graph.height - config.graphDimensions.yPadding);
    config.ctx.lineTo(config.graph.width, config.graph.height - config.graphDimensions.yPadding);
    config.ctx.stroke();
    config.ctx.fillStyle = config.graphStyle.axisFontColor;

    // Draw the X value labels.
    var myMaxX = lineGraphNamespace.getMaxX(config);
    for (var j = 0; j <= myMaxX; j++) {
      if ((j % config.xModulo) === 0 && (j < myMaxX)) {
        config.ctx.fillText(j, lineGraphNamespace.getXPixel(config, j), config.graph.height - config.graphDimensions.yPadding + 15);
      }
    }
    
    // Draw the X title.
    config.ctx.font = config.graphStyle.axisTitleFont;
    config.ctx.fillStyle = config.graphStyle.axisTitleColor;
    config.ctx.fillText(config.xTitle, lineGraphNamespace.getXPixel(config, myMaxX / 2) + config.graphDimensions.xTitleMarginLeft, config.graph.height - config.graphDimensions.yPadding + config.graphDimensions.xTitleMarginBottom);

    // Draw the Y value labels.
    config.ctx.font = config.graphStyle.axisFont;
    config.ctx.fillStyle = config.graphStyle.axisFontColor;
    config.ctx.textAlign = 'right';
    config.ctx.textBaseline = 'middle';
    var myMaxY = lineGraphNamespace.getMaxY(config);
    for (var k = 0; k < myMaxY; k++) {
      if ((k % config.yModulo) === 0) {
        config.ctx.fillText(k, config.graphDimensions.xPadding - 10, lineGraphNamespace.getYPixel(config, k));
      }
    }

    // Draw the Y title.
    config.ctx.save();
    config.ctx.rotate(-Math.PI / 2);
    config.ctx.font = config.graphStyle.axisTitleFont;
    config.ctx.fillStyle = config.graphStyle.axisTitleColor;
    config.ctx.fillText(config.yTitle, config.graphDimensions.xPadding + config.graphDimensions.yTitleMarginLeft, lineGraphNamespace.getYPixel(config, myMaxY / 2) + config.graphDimensions.yTitleMarginBottom);
    config.ctx.restore();

    // Draw the line graph.
    config.ctx.strokeStyle = config.graphStyle.lineColor;
    config.ctx.beginPath();
    config.ctx.moveTo(lineGraphNamespace.getXPixel(config, config.data[0].X), lineGraphNamespace.getYPixel(config, config.data[0].Y));
    for (var l = 1; l < config.data.length; l++) {
      config.ctx.lineTo(lineGraphNamespace.getXPixel(config, config.data[l].X), lineGraphNamespace.getYPixel(config, config.data[l].Y));
    }
    config.ctx.stroke();
  },

  // Returns the max Y value from data.
  getMaxY : function (config) {
    'use strict';

    var max = 0;
    for (var i = 0; i < config.data.length; i++) {
      if (config.data[i].Y > max) {
        max = config.data[i].Y;
      }
    }
    max += config.graphDimensions.yMarginTop;
    return max;
  },

  // Returns the max X value from data.
  getMaxX : function (config) {
    'use strict';

    var max = 0;
    for (var i = 0; i < config.data.length; i++) {
      if (config.data[i].X > max) {
        max = config.data[i].X;
      }
    }
    max += config.graphDimensions.xMarginRight;
    return max;
  },

  // Returns the x pixel for a graph point.
  getXPixel : function (config, val) {
    'use strict';

    return ((config.graph.width - config.graphDimensions.xPadding) / lineGraphNamespace.getMaxX(config)) * val + config.graphDimensions.xPadding;
  },

  // Returns the y pixel for a graph point.
  getYPixel : function (config, val) {
    'use strict';

    return config.graph.height - (((config.graph.height - config.graphDimensions.yPadding) / lineGraphNamespace.getMaxY(config)) * val) - config.graphDimensions.yPadding;
  }
};

/* -------------------------- */
/*  DAEODON GRAPHS NAMESPACE  */
/* -------------------------- */

var daeodonGraphsNamespace = {
  // Computes Daeodon healing rate data.
  getDaeodonHealRateData : function () {
    'use strict';

    var dataset = [];
    for (var i = 0; i <= 100000; i += 500) {
      var healRate = (i / 100) * 0.5;
      if (i > 0 && healRate < 20) {
        healRate = 20;
      }
      if (i > 0 && healRate > 400) {
        healRate = 400;
      }
      dataset.push({X:i,Y:healRate});
    }
    return dataset;
  },

  // Draws tooltip when mouse hovers Daeodon heal rate graph.
  drawDaeodonHealRateTooltip : function (e, config) {
    'use strict';

    var mouseX = parseInt(e.clientX - config.offsetX);
    var mouseY = parseInt(e.clientY - config.offsetY);
    var hit = false;
    for (var i = 0; i < config.dots.length; i++) {
      var dx = mouseX - config.dots[i].x;
      if (dx > -3 && dx < 3) {
        config.tipCanvas.style.left = (config.dots[i].x - 40) + "px";
        config.tipCanvas.style.top = (config.dots[i].y - 40) + "px";
        config.tipCanvas.style.display = 'block';
        config.tipCtx.clearRect(0, 0, config.tipCanvas.width, config.tipCanvas.height);
        config.tipCtx.font = config.graphStyle.tooltipFont;
        config.tipCtx.fillStyle = config.graphStyle.tooltipFontColor;
        config.tipCtx.fillText(config.dots[i].valY + ' HP/sec', 5, 15);
        config.tipCtx.fillText(config.dots[i].valX + ' Max HP', 5, 30);
        hit = true;
      }
    }
    if (!hit) {
      config.tipCanvas.style.display = 'none';
      config.tipCanvas.style.left = '-4000px';
    }
  },

  drawDaeodonHealingRateGraph : function (healRateGraphDivID) {
    'use strict';

    // Get Daeodon heal rate graph div.
    var healRateGraphDiv = $('#' + healRateGraphDivID);
    // If Daeodon heal rate graph div exists.
    if (!(healRateGraphDiv === undefined || healRateGraphDiv === null) && healRateGraphDiv.length > 0) {
      // Add graph canvas.
      var graphCanvasID = 'daeodonHealRateGraphCanvas';
      var graphCanvasObj = document.createElement('canvas');
      graphCanvasObj.id = graphCanvasID;
      graphCanvasObj.width = 700;
      graphCanvasObj.height = 300;
      healRateGraphDiv.append(graphCanvasObj);
      // Add tooltip canvas.
      var tipCanvasID = 'daeodonHealRateTipCanvas';
      var tipCanvasObj = document.createElement('canvas');
      tipCanvasObj.id = tipCanvasID;
      tipCanvasObj.width = 100;
      tipCanvasObj.height = 35;
      healRateGraphDiv.append(tipCanvasObj);
      // Get freshly added canvases elements.
      var graphCanvasElement = $('#' + graphCanvasID);
      var tipCanvasElement = $('#' + tipCanvasID);
      // If canvases exists.
      if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
          !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0) {
        // Create new chart style.
        var chartStyle = new lineGraphNamespace.graphStyle(
          '#d4d4d4', /* Axises color hex. */
          'italic 0.7em Inter, Helvetica, Arial, sans-serif', /* Axises labels font. */
          '#d4d4d4', /* Axises labels color hex. */
          '0.8em Inter, Helvetica, Arial, sans-serif', /* Axises titles font. */
          '#d4d4d4', /* Axises titles color hex. */
          '#ffaf0f', /* Line color hex. */
          '0.8em Inter, Helvetica, Arial, sans-serif', /* Tooltip text font. */
          '#ebebeb' /* Tooltip text color hex. */
        );
        // Create new chart dimensions.
        var chartDimensions = new lineGraphNamespace.graphDimensions(
          50,   /* X axis padding left. */
          40,   /* Y axis padding bottom. */
          0,    /* X axis margin right. */
          30,   /* Y axis margin top. */
          -10,  /* X axis title margin left. */
          34,   /* X axis title margin bottom. */
          -130, /* Y axis title margin left. */
          -120  /* Y axis title margin bottom. */
        );
        // Compute data.
        var chartData = daeodonGraphsNamespace.getDaeodonHealRateData();
        // Create new chart configuration.
        var chartConfig = new lineGraphNamespace.graphConfig(
          graphCanvasID, /* The ID of the graph canvas. */
          tipCanvasID, /* The ID of the tooltip canvas. */
          chartData, /* The graph dataset. */
          daeodonGraphsNamespace.drawDaeodonHealRateTooltip, /* A pointer to the function which draws the tooltip. */
          10000, /* Modulo used to defined the amount of X axis graduations to print. */
          50, /* Modulo used to defined the amount of Y axis graduations to print. */
          'Healed dino max HP', /* The X axis title. */
          'Healing rate (HP/sec)', /* The Y axis title. */
          chartDimensions, /* The object containing graph dimensions. */
          chartStyle /* The object containing graph styling. */
        );
        // Draw the graph.
        lineGraphNamespace.drawGraph(chartConfig);
      }
    }
  },

  refreshDaeodonHealOverTimeConfig : function (config, healingRateInputID, dinoAmountInputID, timeDurationInputID) {
    var timeDurationInputElement = $('#' + timeDurationInputID);
    if (!(timeDurationInputElement === undefined || timeDurationInputElement === null) && timeDurationInputElement.length > 0) {
      var chartData = daeodonGraphsNamespace.computeDaeodonHealOverTimeData(healingRateInputID, dinoAmountInputID, timeDurationInputID);
      config.xModulo = Math.round(parseInt(timeDurationInputElement.val()) / 6);
      config.yModulo = Math.round(chartData.ymax / 6);
      config.data = chartData.data;
    }
  },

  // Function to redraw Daeodon's heal-over-time chart.
  redrawDaeodonHealOverTimeChart : function(chartConfig, healOverTimeGraphDiv,
                                            graphCanvasID, tipCanvasID,
                                            healingRateInputID, dinoAmountInputID, timeDurationInputID) {
    var graphCanvasElement = $('#' + graphCanvasID);
    var tipCanvasElement = $('#' + tipCanvasID);
    if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
        !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0) {
      tipCanvasElement.remove();
      graphCanvasElement.remove();
    }
    daeodonGraphsNamespace.addDaeodonHealOverTimeCanvases(healOverTimeGraphDiv, graphCanvasID, tipCanvasID);
    lineGraphNamespace.refreshGraphConfig(chartConfig, graphCanvasID, tipCanvasID);
    daeodonGraphsNamespace.refreshDaeodonHealOverTimeConfig(chartConfig, healingRateInputID, dinoAmountInputID, timeDurationInputID);
    lineGraphNamespace.drawGraph(chartConfig);
  },

  // Function to bind input values to Daeodon's heal-over-time chart.
  bindInputsToDaeodonHealOverTimeChart : function (chartConfig, healOverTimeGraphDiv, graphCanvasID, tipCanvasID, healingRateInputID, dinoAmountInputID, timeDurationInputID) {
    'use strict';

    var graphCanvasElement = $('#' + graphCanvasID);
    var tipCanvasElement = $('#' + tipCanvasID);
    // Get input elements.
    var healingrateInput = $('#' + healingRateInputID);
    var dinoamountInput = $('#' + dinoAmountInputID);
    var timedurationInput = $('#' + timeDurationInputID);
    // If inputs exists.
    if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
        !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0 &&
        !(healingrateInput === undefined || healingrateInput === null) && healingrateInput.length > 0 &&
        !(dinoamountInput === undefined || dinoamountInput === null) && dinoamountInput.length > 0 &&
        !(timedurationInput === undefined || timedurationInput === null) && timedurationInput.length > 0) {
      // Bind "healing rate" input.
      healingrateInput.unbind('input');
      healingrateInput.on('input', function() {
        daeodonGraphsNamespace.redrawDaeodonHealOverTimeChart(chartConfig, healOverTimeGraphDiv, graphCanvasID, tipCanvasID, healingRateInputID, dinoAmountInputID, timeDurationInputID);
      });
      // Bind "dino amount" input.
      dinoamountInput.unbind('input');
      dinoamountInput.on('input', function() {
        daeodonGraphsNamespace.redrawDaeodonHealOverTimeChart(chartConfig, healOverTimeGraphDiv, graphCanvasID, tipCanvasID, healingRateInputID, dinoAmountInputID, timeDurationInputID);
      });
      // Bind "time duration" input.
      timedurationInput.unbind('input');
      timedurationInput.on('input', function() {
        daeodonGraphsNamespace.redrawDaeodonHealOverTimeChart(chartConfig, healOverTimeGraphDiv, graphCanvasID, tipCanvasID, healingRateInputID, dinoAmountInputID, timeDurationInputID);
      });
    }
  },

  addDaeodonHealOverTimeCanvases : function (healOverTimeGraphDiv, graphCanvasID, tipCanvasID) {
    // Add graph canvas.
    var graphCanvasObj = document.createElement('canvas');
    graphCanvasObj.id = graphCanvasID;
    graphCanvasObj.width = 700;
    graphCanvasObj.height = 300;
    healOverTimeGraphDiv.append(graphCanvasObj);
    // Add tooltip canvas.
    var tipCanvasObj = document.createElement('canvas');
    tipCanvasObj.id = tipCanvasID;
    tipCanvasObj.width = 160;
    tipCanvasObj.height = 65;
    healOverTimeGraphDiv.append(tipCanvasObj);
  },
  
  // Function to generate Daeodon's heal-over-time chart data.
  computeDaeodonHealOverTimeData : function (healingRateInputID, dinoAmountInputID, timeDurationInputID) {
    'use strict';

    var maxValY = 0;
    var dataset = [];
    var healingrateInput = $('#' + healingRateInputID);
    var dinoamountInput = $('#' + dinoAmountInputID);
    var timedurationInput = $('#' + timeDurationInputID);
    if (!(healingrateInput === undefined || healingrateInput === null) && healingrateInput.length > 0 &&
        !(dinoamountInput === undefined || dinoamountInput === null) && dinoamountInput.length > 0 &&
        !(timedurationInput === undefined || timedurationInput === null) && timedurationInput.length > 0) {
      var dinoAmount = parseInt(dinoamountInput.val());
      var healingRate = parseFloat(healingrateInput.val()) * dinoAmount;
      var maxTime = parseInt(timedurationInput.val());
      //lineChartConfig.maxValX = maxTime;
      for (var i = 0; i <= maxTime; i++) {
        var baseFoodConsumption = (i === 0 ? 0 : 100) + (i * 40);
        var healFoodConsumption = (i * healingRate);
        var totalFoodConsumption = baseFoodConsumption + healFoodConsumption;
        dataset.push({X:i,Y:totalFoodConsumption});
        if (i === maxTime) {
          maxValY = totalFoodConsumption;
        }
      }
    }
    return {ymax:maxValY,data:dataset};
  },

  // Draws tooltip when mouse hovers Daeodon heal rate graph.
  drawDaeodonHealOverTimeTooltip : function (e, config) {
    'use strict';

    var mouseX = parseInt(e.clientX - config.offsetX);
    var mouseY = parseInt(e.clientY - config.offsetY);
    var hit = false;
    for (var i = 0; i < config.dots.length; i++) {
      var dx = mouseX - config.dots[i].x;
      if (dx > -3 && dx < 3) {
        var nbDino = $('#' + config.dinoAmountInputID).val();
        var totalHealed = (config.dots[i].valX * $('#' + config.healingRateInputID).val() * nbDino);
        var healedPerDino = (totalHealed / nbDino);
        config.tipCanvas.style.left = (config.dots[i].x - 80) + "px";
        config.tipCanvas.style.top = (config.dots[i].y - 50) + "px";
        config.tipCanvas.style.display = 'block';
        config.tipCtx.clearRect(0, 0, config.tipCanvas.width, config.tipCanvas.height);
        config.tipCtx.font = config.graphStyle.tooltipFont;
        config.tipCtx.fillStyle = config.graphStyle.tooltipFontColor;
        config.tipCtx.fillText(config.dots[i].valY + ' Food consumed', 5, 15);
        config.tipCtx.fillText(config.dots[i].valX + ' Seconds', 5, 30);
        config.tipCtx.fillText(totalHealed + ' Total HP healed', 5, 45);
        config.tipCtx.fillText(healedPerDino + ' HP healed/dino', 5, 60);
        hit = true;
      }
    }
    if (!hit) {
      config.tipCanvas.style.display = 'none';
      config.tipCanvas.style.left = '-4000px';
    }
  },

  drawDaeodonHealOverTimeGraph : function (healOverTimeGraphDivID) {
    'use strict';

    // Get Daeodon heal rate graph div.
    var healOverTimeGraphDiv = $('#' + healOverTimeGraphDivID);
    // If Daeodon heal rate graph div exists.
    if (!(healOverTimeGraphDiv === undefined || healOverTimeGraphDiv === null) && healOverTimeGraphDiv.length > 0) {
      // Add "healing rate" input.
      var healingRateInputID = 'lcDaeodonHealingRateInput';
      healOverTimeGraphDiv.append('<label for="' + healingRateInputID + '" class="daeodonLineChartInputLabelStyle">Daeodon healing rate: </label>');
      healOverTimeGraphDiv.append('<input type="number" id="' + healingRateInputID + '" name="' + healingRateInputID + '" class="daeodonLineChartInputStyle" min="20" max="99999" value="137.5" style="width: 70px;" />&nbsp;&nbsp;');
      // Add "dino amount" input.
      var dinoAmountInputID = 'lcDaeodonDinoAmountInput';
      healOverTimeGraphDiv.append('<label for="' + dinoAmountInputID + '" class="daeodonLineChartInputLabelStyle">Amount of dinos to heal: </label>');
      healOverTimeGraphDiv.append('<input type="number" id="' + dinoAmountInputID + '" name="' + dinoAmountInputID + '" class="daeodonLineChartInputStyle" min="1" max="30" value="1" style="width: 70px;" />&nbsp;&nbsp;');
      // Add "time duration" input.
      var timeDurationInputID = 'lcDaeodonTimeDurationInput';
      healOverTimeGraphDiv.append('<label for="' + timeDurationInputID + '" class="daeodonLineChartInputLabelStyle">Max time (seconds): </label>');
      healOverTimeGraphDiv.append('<input type="number" id="' + timeDurationInputID + '" name="' + timeDurationInputID + '" class="daeodonLineChartInputStyle" min="1" max="999" value="300" style="width: 70px;" />');
      // Add canvases.
      var graphCanvasID = 'daeodonHealOverTimeGraphCanvas';
      var tipCanvasID = 'daeodonHealOverTimeTipCanvas';
      daeodonGraphsNamespace.addDaeodonHealOverTimeCanvases(healOverTimeGraphDiv, graphCanvasID, tipCanvasID);
      // Get document elements.
      var graphCanvasElement = $('#' + graphCanvasID);
      var tipCanvasElement = $('#' + tipCanvasID);
      var timeDurationInputElement = $('#' + timeDurationInputID);
      // If canvases exists.
      if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
          !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0 &&
          !(timeDurationInputElement === undefined || timeDurationInputElement === null) && timeDurationInputElement.length > 0) {
        // Create new chart style.
        var chartStyle = new lineGraphNamespace.graphStyle(
          '#d4d4d4', /* Axises color hex. */
          'italic 0.7em Inter, Helvetica, Arial, sans-serif', /* Axises labels font. */
          '#d4d4d4', /* Axises labels color hex. */
          '0.8em Inter, Helvetica, Arial, sans-serif', /* Axises titles font. */
          '#d4d4d4', /* Axises titles color hex. */
          '#ffaf0f', /* Line color hex. */
          '0.8em Inter, Helvetica, Arial, sans-serif', /* Tooltip text font. */
          '#ebebeb' /* Tooltip text color hex. */
        );
        // Create new chart dimensions.
        var chartDimensions = new lineGraphNamespace.graphDimensions(
          75,   /* X axis padding left. */
          40,   /* Y axis padding bottom. */
          0,    /* X axis margin right. */
          30,   /* Y axis margin top. */
          -10,  /* X axis title margin left. */
          34,   /* X axis title margin bottom. */
          -130, /* Y axis title margin left. */
          -120  /* Y axis title margin bottom. */
        );
        // Compute data.
        var chartData = daeodonGraphsNamespace.computeDaeodonHealOverTimeData(healingRateInputID, dinoAmountInputID, timeDurationInputID);
        // Create new chart configuration.
        var xModulo = Math.round(parseInt(timeDurationInputElement.val()) / 6);
        var yModulo = Math.round(chartData.ymax / 6);
        var chartConfig = new lineGraphNamespace.graphConfig(
          graphCanvasID, /* The ID of the graph canvas. */
          tipCanvasID, /* The ID of the tooltip canvas. */
          chartData.data, /* The graph dataset. */
          daeodonGraphsNamespace.drawDaeodonHealOverTimeTooltip, /* A pointer to the function which draws the tooltip. */
          xModulo, /* Modulo used to defined the amount of X axis graduations to print. */
          yModulo, /* Modulo used to defined the amount of Y axis graduations to print. */
          'Time in seconds', /* The X axis title. */
          'Total food consumed', /* The Y axis title. */
          chartDimensions, /* The object containing graph dimensions. */
          chartStyle /* The object containing graph styling. */
        );
        chartConfig.healingRateInputID = healingRateInputID;
        chartConfig.dinoAmountInputID = dinoAmountInputID;
        // Bind inputs.
        daeodonGraphsNamespace.bindInputsToDaeodonHealOverTimeChart(chartConfig, healOverTimeGraphDiv, graphCanvasID, tipCanvasID, healingRateInputID, dinoAmountInputID, timeDurationInputID);
        // Draw the graph.
        lineGraphNamespace.drawGraph(chartConfig);
      }
    }
  }
};

/* ------------- */
/*  DRAW GRAPHS  */
/* ------------- */

$( document ).ready(function() {
  'use strict';

  daeodonGraphsNamespace.drawDaeodonHealingRateGraph('daeodonHealRateGraph');
  daeodonGraphsNamespace.drawDaeodonHealOverTimeGraph('daeodonHealOverTimeGraph');
});
