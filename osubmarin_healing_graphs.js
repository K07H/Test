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
                              yAxisTitleMarginLeft, yAxisTitleMarginBottom,
                              tooltipMarginLeft, tooltipMarginBottom) {
    this.xPadding = xAxisPadding;
    this.yPadding = yAxisPadding;
    this.xMarginRight = xAxisMarginRight;
    this.yMarginTop = yAxisMarginTop;
    this.xTitleMarginLeft = xAxisTitleMarginLeft;
    this.xTitleMarginBottom = xAxisTitleMarginBottom;
    this.yTitleMarginLeft = yAxisTitleMarginLeft;
    this.yTitleMarginBottom = yAxisTitleMarginBottom;
    this.tooltipMarginLeft = tooltipMarginLeft;
    this.tooltipMarginBottom = tooltipMarginBottom;
  },

  // Object storing graph axises configuration.
  graphAxisesConfig : function (xAxisModulo, yAxisModulo, xAxisTitle, yAxisTitle) {
    this.xModulo = xAxisModulo;
    this.yModulo = yAxisModulo;
    this.xTitle = xAxisTitle;
    this.yTitle = yAxisTitle;
  },

  // Object storing the various IDs.
  graphElementsIDs : function() {
    // Generic IDs.
    this.graphCanvasID = ''; /* The ID of the graph canvas. */
    this.tipCanvasID = ''; /* The ID of the tooltip canvas. */

    // Healing-rate graph elements IDs.
    this.healRateGraphDivID = ''; /* The ID of the graph div. */

    // Heal-over-time graph elements IDs.
    this.healOverTimeGraphDivID = ''; /* The ID of the graph div. */
    this.healingRateInputID = ''; /* The ID of "healing rate" input field. */
    this.dinoAmountInputID = ''; /* The ID of "dino amount" input field. */
    this.timeDurationInputID = ''; /* The ID of "time duration" input field. */
  },

  // Object storing graph configuration.
  graphConfig : function (elemIDs, graphData, drawTooltipFuncPtr,
                          axisesConfig, dimensions, styles) {
    this.graphElemIDs = elemIDs;
    this.data = graphData;
    this.drawTooltipFunc = drawTooltipFuncPtr;
    this.graphAxises = axisesConfig;
    this.graphDimensions = dimensions;
    this.graphStyle = styles;

    this.graphJquery = $('#' + this.graphElemIDs.graphCanvasID);
    this.graph = document.getElementById(this.graphElemIDs.graphCanvasID);
    this.tipJquery = $('#' + this.graphElemIDs.tipCanvasID);
    this.tipCanvas = document.getElementById(this.graphElemIDs.tipCanvasID);
    this.ctx = this.graph.getContext('2d');
    this.tipCtx = this.tipCanvas.getContext('2d');

    this.canvasOffset = this.graphJquery.offset();
    this.offsetX = this.canvasOffset.left;
    this.offsetY = this.canvasOffset.top;

    this.dots = null;
  },

  // Function to refresh objects from config (needed when redrawing the graph).
  refreshGraphConfig : function(config) {
    'use strict';

    config.graphJquery = $('#' + config.graphElemIDs.graphCanvasID);
    config.graph = document.getElementById(config.graphElemIDs.graphCanvasID);
    config.tipJquery = $('#' + config.graphElemIDs.tipCanvasID);
    config.tipCanvas = document.getElementById(config.graphElemIDs.tipCanvasID);
    config.ctx = config.graph.getContext('2d');
    config.tipCtx = config.tipCanvas.getContext('2d');

    config.canvasOffset = config.graphJquery.offset();
    config.offsetX = config.canvasOffset.left;
    config.offsetY = config.canvasOffset.top;
  },

  // Function to hide graph tooltip.
  doHideTooltip : function (e, config) {
    'use strict';

    var mouseX = parseInt(e.clientX, 10);
    var mouseY = parseInt(e.clientY, 10);
    var bounds = config.graph.getBoundingClientRect();
    if (mouseX <= bounds.x || mouseX >= bounds.x + bounds.width || mouseY <= bounds.y || mouseY >= bounds.y + bounds.height) {
      config.tipCanvas.style.display = 'none';
      config.tipCanvas.style.left = '-4000px';
    }
  },

  // Function to draw the line graph.
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
      if ((j % config.graphAxises.xModulo) === 0 && (j < myMaxX)) {
        config.ctx.fillText(j, lineGraphNamespace.getXPixel(config, j), config.graph.height - config.graphDimensions.yPadding + 15);
      }
    }

    // Draw the X title.
    config.ctx.font = config.graphStyle.axisTitleFont;
    config.ctx.fillStyle = config.graphStyle.axisTitleColor;
    config.ctx.fillText(config.graphAxises.xTitle, lineGraphNamespace.getXPixel(config, myMaxX / 2) + config.graphDimensions.xTitleMarginLeft, config.graph.height - config.graphDimensions.yPadding + config.graphDimensions.xTitleMarginBottom);

    // Draw the Y value labels.
    config.ctx.font = config.graphStyle.axisFont;
    config.ctx.fillStyle = config.graphStyle.axisFontColor;
    config.ctx.textAlign = 'right';
    config.ctx.textBaseline = 'middle';
    var myMaxY = lineGraphNamespace.getMaxY(config);
    for (var k = 0; k < myMaxY; k++) {
      if ((k % config.graphAxises.yModulo) === 0) {
        config.ctx.fillText(k, config.graphDimensions.xPadding - 10, lineGraphNamespace.getYPixel(config, k));
      }
    }

    // Draw the Y title.
    config.ctx.save();
    config.ctx.rotate(-Math.PI / 2);
    config.ctx.font = config.graphStyle.axisTitleFont;
    config.ctx.fillStyle = config.graphStyle.axisTitleColor;
    config.ctx.fillText(config.graphAxises.yTitle, config.graphDimensions.xPadding + config.graphDimensions.yTitleMarginLeft, lineGraphNamespace.getYPixel(config, myMaxY / 2) + config.graphDimensions.yTitleMarginBottom);
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

  // Function returning the max Y value from data.
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

  // Function returning the max X value from data.
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

  // Function returning the x pixel for a graph point.
  getXPixel : function (config, val) {
    'use strict';

    return ((config.graph.width - config.graphDimensions.xPadding) / lineGraphNamespace.getMaxX(config)) * val + config.graphDimensions.xPadding;
  },

  // Function returning the y pixel for a graph point.
  getYPixel : function (config, val) {
    'use strict';

    return config.graph.height - (((config.graph.height - config.graphDimensions.yPadding) / lineGraphNamespace.getMaxY(config)) * val) - config.graphDimensions.yPadding;
  }
};

/* -------------------------- */
/*  DAEODON GRAPHS NAMESPACE  */
/* -------------------------- */

var daeodonGraphsNamespace = {
  // Function to compute Daeodon's healing rate data.
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

  // Function to draw tooltip when mouse hovers Daeodon's heal rate graph.
  drawDaeodonHealRateTooltip : function (e, config) {
    'use strict';

    var mouseX = parseInt(e.clientX - config.offsetX, 10);
    var hit = false;
    for (var i = 0; i < config.dots.length; i++) {
      var dx = mouseX - config.dots[i].x;
      if (dx > -3 && dx < 3) {
        config.tipCanvas.style.left = (config.dots[i].x + config.graphDimensions.tooltipMarginLeft) + 'px';
        config.tipCanvas.style.top = (config.dots[i].y + config.graphDimensions.tooltipMarginBottom) + 'px';
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

  // Function to draw Daeodon's healing rate graph.
  drawDaeodonHealingRateGraph : function (healRateGraphDivID) {
    'use strict';

    // Create new IDs storage object.
    var elemIDs = new lineGraphNamespace.graphElementsIDs();
    elemIDs.healRateGraphDivID = healRateGraphDivID;
    elemIDs.graphCanvasID = 'daeodonHealRateGraphCanvas';
    elemIDs.tipCanvasID = 'daeodonHealRateTipCanvas';
    // Get Daeodon heal rate graph div.
    var healRateGraphDiv = $('#' + elemIDs.healRateGraphDivID);
    // If Daeodon heal rate graph div exists.
    if (!(healRateGraphDiv === undefined || healRateGraphDiv === null) && healRateGraphDiv.length > 0) {
      // Add graph canvas.
      var graphCanvasObj = document.createElement('canvas');
      graphCanvasObj.id = elemIDs.graphCanvasID;
      graphCanvasObj.width = 700;
      graphCanvasObj.height = 300;
      healRateGraphDiv.append(graphCanvasObj);
      // Add tooltip canvas.
      var tipCanvasObj = document.createElement('canvas');
      tipCanvasObj.id = elemIDs.tipCanvasID;
      tipCanvasObj.width = 100;
      tipCanvasObj.height = 35;
      healRateGraphDiv.append(tipCanvasObj);
      // Get freshly added canvases elements.
      var graphCanvasElement = $('#' + elemIDs.graphCanvasID);
      var tipCanvasElement = $('#' + elemIDs.tipCanvasID);
      // If canvases exists.
      if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
          !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0) {
        // Create new graph style.
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
        // Create new graph dimensions.
        var chartDimensions = new lineGraphNamespace.graphDimensions(
          50,   /* X axis padding left. */
          40,   /* Y axis padding bottom. */
          0,    /* X axis margin right. */
          30,   /* Y axis margin top. */
          -10,  /* X axis title margin left. */
          34,   /* X axis title margin bottom. */
          -130, /* Y axis title margin left. */
          -120, /* Y axis title margin bottom. */
          -50,  /* Tooltip margin left. */
          -40   /* Tooltip margin bottom. */
        );
        // Create new axises configuration.
        var axisesConfig = new lineGraphNamespace.graphAxisesConfig(
          10000, /* Modulo used to defined the amount of X axis graduations to print. */
          50, /* Modulo used to defined the amount of Y axis graduations to print. */
          'Healed dino max HP', /* The X axis title. */
          'Healing rate (HP/sec)' /* The Y axis title. */
        );
        // Compute data.
        var chartData = daeodonGraphsNamespace.getDaeodonHealRateData();
        // Create new graph configuration.
        var chartConfig = new lineGraphNamespace.graphConfig(
          elemIDs, /* The various elements IDs. */
          chartData, /* The graph dataset. */
          daeodonGraphsNamespace.drawDaeodonHealRateTooltip, /* A pointer to the function which draws the tooltip. */
          axisesConfig, /* The object containing graph axises configuration. */
          chartDimensions, /* The object containing graph dimensions. */
          chartStyle /* The object containing graph styling. */
        );
        // Draw the graph.
        lineGraphNamespace.drawGraph(chartConfig);
      }
    }
  },

  // Function to regenerate Daeodon's heal-over-time graph data and modulos.
  refreshDaeodonHealOverTimeConfig : function (config) {
    var timeDurationInputElement = $('#' + config.graphElemIDs.timeDurationInputID);
    if (!(timeDurationInputElement === undefined || timeDurationInputElement === null) && timeDurationInputElement.length > 0) {
      var chartData = daeodonGraphsNamespace.computeDaeodonHealOverTimeData(config.graphElemIDs);
      config.graphAxises.xModulo = Math.round(parseInt(timeDurationInputElement.val(), 10) / 6);
      config.graphAxises.yModulo = Math.round(chartData.ymax / 6);
      config.data = chartData.data;
    }
  },

  // Function to redraw Daeodon's heal-over-time graph.
  redrawDaeodonHealOverTimeChart : function(chartConfig, healOverTimeGraphDiv) {
    // Get canvases elements.
    var graphCanvasElement = $('#' + chartConfig.graphElemIDs.graphCanvasID);
    var tipCanvasElement = $('#' + chartConfig.graphElemIDs.tipCanvasID);
    // If canvases elements exists.
    if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
        !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0) {
      // Remove canvases elements.
      tipCanvasElement.remove();
      graphCanvasElement.remove();
    }
    // Add new canvases elements.
    daeodonGraphsNamespace.addDaeodonHealOverTimeCanvases(healOverTimeGraphDiv, chartConfig.graphElemIDs);
    // Update data and config.
    lineGraphNamespace.refreshGraphConfig(chartConfig);
    daeodonGraphsNamespace.refreshDaeodonHealOverTimeConfig(chartConfig);
    // Draw the updated graph.
    lineGraphNamespace.drawGraph(chartConfig);
  },

  // Function to bind input fields to Daeodon's heal-over-time graph.
  bindInputsToDaeodonHealOverTimeChart : function (chartConfig, healOverTimeGraphDiv) {
    'use strict';

    // Get canvases elements.
    var graphCanvasElement = $('#' + chartConfig.graphElemIDs.graphCanvasID);
    var tipCanvasElement = $('#' + chartConfig.graphElemIDs.tipCanvasID);
    // Get input elements.
    var healingrateInput = $('#' + chartConfig.graphElemIDs.healingRateInputID);
    var dinoamountInput = $('#' + chartConfig.graphElemIDs.dinoAmountInputID);
    var timedurationInput = $('#' + chartConfig.graphElemIDs.timeDurationInputID);
    // If inputs exists.
    if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
        !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0 &&
        !(healingrateInput === undefined || healingrateInput === null) && healingrateInput.length > 0 &&
        !(dinoamountInput === undefined || dinoamountInput === null) && dinoamountInput.length > 0 &&
        !(timedurationInput === undefined || timedurationInput === null) && timedurationInput.length > 0) {
      // Bind "healing rate" input.
      healingrateInput.unbind('input');
      healingrateInput.on('input', function() {
        daeodonGraphsNamespace.redrawDaeodonHealOverTimeChart(chartConfig, healOverTimeGraphDiv);
      });
      // Bind "dino amount" input.
      dinoamountInput.unbind('input');
      dinoamountInput.on('input', function() {
        daeodonGraphsNamespace.redrawDaeodonHealOverTimeChart(chartConfig, healOverTimeGraphDiv);
      });
      // Bind "time duration" input.
      timedurationInput.unbind('input');
      timedurationInput.on('input', function() {
        daeodonGraphsNamespace.redrawDaeodonHealOverTimeChart(chartConfig, healOverTimeGraphDiv);
      });
    }
  },

  // Function to add canvases elements into Daeodon's heal-over-time graph div.
  addDaeodonHealOverTimeCanvases : function (healOverTimeGraphDiv, elemIDs) {
    // Add graph canvas.
    var graphCanvasObj = document.createElement('canvas');
    graphCanvasObj.id = elemIDs.graphCanvasID;
    graphCanvasObj.width = 700;
    graphCanvasObj.height = 300;
    healOverTimeGraphDiv.append(graphCanvasObj);
    // Add tooltip canvas.
    var tipCanvasObj = document.createElement('canvas');
    tipCanvasObj.id = elemIDs.tipCanvasID;
    tipCanvasObj.width = 160;
    tipCanvasObj.height = 65;
    healOverTimeGraphDiv.append(tipCanvasObj);
  },

  // Function to compute Daeodon's heal-over-time graph data.
  computeDaeodonHealOverTimeData : function (elemIDs) {
    'use strict';

    var maxValY = 0;
    var dataset = [];
    var healingrateInput = $('#' + elemIDs.healingRateInputID);
    var dinoamountInput = $('#' + elemIDs.dinoAmountInputID);
    var timedurationInput = $('#' + elemIDs.timeDurationInputID);
    if (!(healingrateInput === undefined || healingrateInput === null) && healingrateInput.length > 0 &&
        !(dinoamountInput === undefined || dinoamountInput === null) && dinoamountInput.length > 0 &&
        !(timedurationInput === undefined || timedurationInput === null) && timedurationInput.length > 0) {
      var dinoAmount = parseInt(dinoamountInput.val(), 10);
      var healingRate = parseFloat(healingrateInput.val()) * dinoAmount;
      var maxTime = parseInt(timedurationInput.val(), 10);
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

  // Function to draw tooltip when mouse hovers Daeodon's heal-over-time graph.
  drawDaeodonHealOverTimeTooltip : function (e, config) {
    'use strict';

    var mouseX = parseInt(e.clientX - config.offsetX, 10);
    var hit = false;
    for (var i = 0; i < config.dots.length; i++) {
      var dx = mouseX - config.dots[i].x;
      if (dx > -3 && dx < 3) {
        var nbDino = $('#' + config.graphElemIDs.dinoAmountInputID).val();
        var totalHealed = (config.dots[i].valX * $('#' + config.graphElemIDs.healingRateInputID).val() * nbDino);
        var healedPerDino = (totalHealed / nbDino);
        config.tipCanvas.style.left = (config.dots[i].x + config.graphDimensions.tooltipMarginLeft) + 'px';
        config.tipCanvas.style.top = (config.dots[i].y + config.graphDimensions.tooltipMarginBottom) + 'px';
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

  // Function to draw Daeodon's heal-over-time graph.
  drawDaeodonHealOverTimeGraph : function (healOverTimeGraphDivID) {
    'use strict';

    // Create new IDs storage object.
    var elemIDs = new lineGraphNamespace.graphElementsIDs();
    elemIDs.healOverTimeGraphDivID = healOverTimeGraphDivID;
    elemIDs.graphCanvasID = 'daeodonHealOverTimeGraphCanvas';
    elemIDs.tipCanvasID = 'daeodonHealOverTimeTipCanvas';
    elemIDs.healingRateInputID = 'lcDaeodonHealingRateInput';
    elemIDs.dinoAmountInputID = 'lcDaeodonDinoAmountInput';
    elemIDs.timeDurationInputID = 'lcDaeodonTimeDurationInput';
    // Get Daeodon's heal-over-time graph div.
    var healOverTimeGraphDiv = $('#' + elemIDs.healOverTimeGraphDivID);
    // If Daeodon's heal-over-time graph div exists.
    if (!(healOverTimeGraphDiv === undefined || healOverTimeGraphDiv === null) && healOverTimeGraphDiv.length > 0) {
      // Add "healing rate" input.
      healOverTimeGraphDiv.append('<label for="' + elemIDs.healingRateInputID + '" class="daeodonLineChartInputLabelStyle">Daeodon healing rate: </label>');
      healOverTimeGraphDiv.append('<input type="number" id="' + elemIDs.healingRateInputID + '" name="' + elemIDs.healingRateInputID + '" class="daeodonLineChartInputStyle" min="20" max="400" value="137.5" style="width: 70px;" />&nbsp;&nbsp;');
      // Add "dino amount" input.
      healOverTimeGraphDiv.append('<label for="' + elemIDs.dinoAmountInputID + '" class="daeodonLineChartInputLabelStyle">Amount of dinos to heal: </label>');
      healOverTimeGraphDiv.append('<input type="number" id="' + elemIDs.dinoAmountInputID + '" name="' + elemIDs.dinoAmountInputID + '" class="daeodonLineChartInputStyle" min="1" max="30" value="1" style="width: 70px;" />&nbsp;&nbsp;');
      // Add "time duration" input.
      healOverTimeGraphDiv.append('<label for="' + elemIDs.timeDurationInputID + '" class="daeodonLineChartInputLabelStyle">Max time (seconds): </label>');
      healOverTimeGraphDiv.append('<input type="number" id="' + elemIDs.timeDurationInputID + '" name="' + elemIDs.timeDurationInputID + '" class="daeodonLineChartInputStyle" min="1" max="999" value="300" style="width: 70px;" />');
      // Add canvases.
      daeodonGraphsNamespace.addDaeodonHealOverTimeCanvases(healOverTimeGraphDiv, elemIDs);
      // Get document elements.
      var graphCanvasElement = $('#' + elemIDs.graphCanvasID);
      var tipCanvasElement = $('#' + elemIDs.tipCanvasID);
      var timeDurationInputElement = $('#' + elemIDs.timeDurationInputID);
      // If canvases exists.
      if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
          !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0 &&
          !(timeDurationInputElement === undefined || timeDurationInputElement === null) && timeDurationInputElement.length > 0) {
        // Create new graph style.
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
        // Create new graph dimensions.
        var chartDimensions = new lineGraphNamespace.graphDimensions(
          75,   /* X axis padding left. */
          40,   /* Y axis padding bottom. */
          0,    /* X axis margin right. */
          30,   /* Y axis margin top. */
          -10,  /* X axis title margin left. */
          34,   /* X axis title margin bottom. */
          -130, /* Y axis title margin left. */
          -120, /* Y axis title margin bottom. */
          -75,  /* Tooltip margin left. */
          -50   /* Tooltip margin bottom. */
        );
        // Compute data.
        var chartData = daeodonGraphsNamespace.computeDaeodonHealOverTimeData(elemIDs);
        // Create new axises configuration.
        var axisesConfig = new lineGraphNamespace.graphAxisesConfig(
          Math.round(parseInt(timeDurationInputElement.val(), 10) / 6), /* Modulo used to defined the amount of X axis graduations to print. */
          Math.round(chartData.ymax / 6), /* Modulo used to defined the amount of Y axis graduations to print. */
          'Time in seconds', /* The X axis title. */
          'Total food consumed' /* The Y axis title. */
        );
        // Create new graph configuration.
        var chartConfig = new lineGraphNamespace.graphConfig(
          elemIDs, /* The various elements IDs. */
          chartData.data, /* The graph dataset. */
          daeodonGraphsNamespace.drawDaeodonHealOverTimeTooltip, /* A pointer to the function which draws the tooltip. */
          axisesConfig, /* The object containing graph axises configuration. */
          chartDimensions, /* The object containing graph dimensions. */
          chartStyle /* The object containing graph styling. */
        );
        // Bind inputs.
        daeodonGraphsNamespace.bindInputsToDaeodonHealOverTimeChart(chartConfig, healOverTimeGraphDiv);
        // Draw the graph.
        lineGraphNamespace.drawGraph(chartConfig);
      }
    }
  }
};

/* ------------------------------ */
/*  VEGGIE CAKE GRAPHS NAMESPACE  */
/* ------------------------------ */

var veggieCakeGraphsNamespace = {
  // Function to compute Veggie Cake's healing rate data.
  getVeggieCakeHealRateData : function () {
    'use strict';

    var dataset = [];
    var minHealRate = 500 / 30;
    var maxHealRate = 2100 / 30;
    for (var i = 0; i <= 30000; i += 200) {
      var healRate = ((i / 100) * 10) / 30;
      if (i > 0 && healRate < minHealRate) {
        healRate = minHealRate;
      }
      if (i > 0 && healRate > maxHealRate) {
        healRate = maxHealRate;
      }
      dataset.push({X:i,Y:healRate});
    }
    return dataset;
  },

  // Function to draw tooltip when mouse hovers Veggie Cake's heal rate graph.
  drawVeggieCakeHealRateTooltip : function (e, config) {
    'use strict';

    var mouseX = parseInt(e.clientX - config.offsetX, 10);
    var hit = false;
    for (var i = 0; i < config.dots.length; i++) {
      var dx = mouseX - config.dots[i].x;
      if (dx > -3 && dx < 3) {
        config.tipCanvas.style.left = (config.dots[i].x + config.graphDimensions.tooltipMarginLeft) + 'px';
        config.tipCanvas.style.top = (config.dots[i].y + config.graphDimensions.tooltipMarginBottom) + 'px';
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

  // Function to draw Veggie Cake's healing rate graph.
  drawVeggieCakeHealingRateGraph : function (healRateGraphDivID) {
    'use strict';

    // Create new IDs storage object.
    var elemIDs = new lineGraphNamespace.graphElementsIDs();
    elemIDs.healRateGraphDivID = healRateGraphDivID;
    elemIDs.graphCanvasID = 'veggieCakeHealRateGraphCanvas';
    elemIDs.tipCanvasID = 'veggieCakeHealRateTipCanvas';
    // Get Veggie Cake heal rate graph div.
    var healRateGraphDiv = $('#' + elemIDs.healRateGraphDivID);
    // If Veggie Cake heal rate graph div exists.
    if (!(healRateGraphDiv === undefined || healRateGraphDiv === null) && healRateGraphDiv.length > 0) {
      // Add graph canvas.
      var graphCanvasObj = document.createElement('canvas');
      graphCanvasObj.id = elemIDs.graphCanvasID;
      graphCanvasObj.width = 700;
      graphCanvasObj.height = 300;
      healRateGraphDiv.append(graphCanvasObj);
      // Add tooltip canvas.
      var tipCanvasObj = document.createElement('canvas');
      tipCanvasObj.id = elemIDs.tipCanvasID;
      tipCanvasObj.width = 100;
      tipCanvasObj.height = 35;
      healRateGraphDiv.append(tipCanvasObj);
      // Get freshly added canvases elements.
      var graphCanvasElement = $('#' + elemIDs.graphCanvasID);
      var tipCanvasElement = $('#' + elemIDs.tipCanvasID);
      // If canvases exists.
      if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
          !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0) {
        // Create new graph style.
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
        // Create new graph dimensions.
        var chartDimensions = new lineGraphNamespace.graphDimensions(
          50,   /* X axis padding left. */
          40,   /* Y axis padding bottom. */
          0,    /* X axis margin right. */
          30,   /* Y axis margin top. */
          -10,  /* X axis title margin left. */
          34,   /* X axis title margin bottom. */
          -130, /* Y axis title margin left. */
          -120, /* Y axis title margin bottom. */
          -50,  /* Tooltip margin left. */
          -40   /* Tooltip margin bottom. */
        );
        // Create new axises configuration.
        var axisesConfig = new lineGraphNamespace.graphAxisesConfig(
          2500, /* Modulo used to defined the amount of X axis graduations to print. */
          20, /* Modulo used to defined the amount of Y axis graduations to print. */
          'Healed dino max HP', /* The X axis title. */
          'Healing rate (HP/sec)' /* The Y axis title. */
        );
        // Compute data.
        var chartData = veggieCakeGraphsNamespace.getVeggieCakeHealRateData();
        // Create new graph configuration.
        var chartConfig = new lineGraphNamespace.graphConfig(
          elemIDs, /* The various elements IDs. */
          chartData, /* The graph dataset. */
          veggieCakeGraphsNamespace.drawVeggieCakeHealRateTooltip, /* A pointer to the function which draws the tooltip. */
          axisesConfig, /* The object containing graph axises configuration. */
          chartDimensions, /* The object containing graph dimensions. */
          chartStyle /* The object containing graph styling. */
        );
        // Draw the graph.
        lineGraphNamespace.drawGraph(chartConfig);
      }
    }
  },

  // Function to regenerate Veggie Cake's heal-over-time graph data and modulos.
  refreshVeggieCakeHealOverTimeConfig : function (config) {
    var timeDurationInputElement = $('#' + config.graphElemIDs.timeDurationInputID);
    if (!(timeDurationInputElement === undefined || timeDurationInputElement === null) && timeDurationInputElement.length > 0) {
      var chartData = veggieCakeGraphsNamespace.computeVeggieCakeHealOverTimeData(config.graphElemIDs);
      config.graphAxises.xModulo = Math.round(parseInt(timeDurationInputElement.val(), 10) / 6);
      config.graphAxises.yModulo = Math.round(chartData.ymax / 6);
      config.data = chartData.data;
    }
  },

  // Function to redraw Veggie Cake's heal-over-time graph.
  redrawVeggieCakeHealOverTimeChart : function(chartConfig, healOverTimeGraphDiv) {
    // Get canvases elements.
    var graphCanvasElement = $('#' + chartConfig.graphElemIDs.graphCanvasID);
    var tipCanvasElement = $('#' + chartConfig.graphElemIDs.tipCanvasID);
    // If canvases elements exists.
    if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
        !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0) {
      // Remove canvases elements.
      tipCanvasElement.remove();
      graphCanvasElement.remove();
    }
    // Add new canvases elements.
    veggieCakeGraphsNamespace.addVeggieCakeHealOverTimeCanvases(healOverTimeGraphDiv, chartConfig.graphElemIDs);
    // Update data and config.
    lineGraphNamespace.refreshGraphConfig(chartConfig);
    veggieCakeGraphsNamespace.refreshVeggieCakeHealOverTimeConfig(chartConfig);
    // Draw the updated graph.
    lineGraphNamespace.drawGraph(chartConfig);
  },

  // Function to bind input fields to Veggie Cake's heal-over-time graph.
  bindInputsToVeggieCakeHealOverTimeChart : function (chartConfig, healOverTimeGraphDiv) {
    'use strict';

    // Get canvases elements.
    var graphCanvasElement = $('#' + chartConfig.graphElemIDs.graphCanvasID);
    var tipCanvasElement = $('#' + chartConfig.graphElemIDs.tipCanvasID);
    // Get input elements.
    var healingrateInput = $('#' + chartConfig.graphElemIDs.healingRateInputID);
    var dinoamountInput = $('#' + chartConfig.graphElemIDs.dinoAmountInputID);
    var timedurationInput = $('#' + chartConfig.graphElemIDs.timeDurationInputID);
    // If inputs exists.
    if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
        !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0 &&
        !(healingrateInput === undefined || healingrateInput === null) && healingrateInput.length > 0 &&
        !(dinoamountInput === undefined || dinoamountInput === null) && dinoamountInput.length > 0 &&
        !(timedurationInput === undefined || timedurationInput === null) && timedurationInput.length > 0) {
      // Bind "healing rate" input.
      healingrateInput.unbind('input');
      healingrateInput.on('input', function() {
        veggieCakeGraphsNamespace.redrawVeggieCakeHealOverTimeChart(chartConfig, healOverTimeGraphDiv);
      });
      // Bind "dino amount" input.
      dinoamountInput.unbind('input');
      dinoamountInput.on('input', function() {
        veggieCakeGraphsNamespace.redrawVeggieCakeHealOverTimeChart(chartConfig, healOverTimeGraphDiv);
      });
      // Bind "time duration" input.
      timedurationInput.unbind('input');
      timedurationInput.on('input', function() {
        veggieCakeGraphsNamespace.redrawVeggieCakeHealOverTimeChart(chartConfig, healOverTimeGraphDiv);
      });
    }
  },

  // Function to add canvases elements into Veggie Cake's heal-over-time graph div.
  addVeggieCakeHealOverTimeCanvases : function (healOverTimeGraphDiv, elemIDs) {
    // Add graph canvas.
    var graphCanvasObj = document.createElement('canvas');
    graphCanvasObj.id = elemIDs.graphCanvasID;
    graphCanvasObj.width = 700;
    graphCanvasObj.height = 300;
    healOverTimeGraphDiv.append(graphCanvasObj);
    // Add tooltip canvas.
    var tipCanvasObj = document.createElement('canvas');
    tipCanvasObj.id = elemIDs.tipCanvasID;
    tipCanvasObj.width = 160;
    tipCanvasObj.height = 65;
    healOverTimeGraphDiv.append(tipCanvasObj);
  },

  // Function to compute Veggie Cake's heal-over-time graph data.
  computeVeggieCakeHealOverTimeData : function (elemIDs) {
    'use strict';

    var maxValY = 0;
    var dataset = [];
    var healingrateInput = $('#' + elemIDs.healingRateInputID);
    var dinoamountInput = $('#' + elemIDs.dinoAmountInputID);
    var timedurationInput = $('#' + elemIDs.timeDurationInputID);
    if (!(healingrateInput === undefined || healingrateInput === null) && healingrateInput.length > 0 &&
        !(dinoamountInput === undefined || dinoamountInput === null) && dinoamountInput.length > 0 &&
        !(timedurationInput === undefined || timedurationInput === null) && timedurationInput.length > 0) {
      var dinoAmount = parseInt(dinoamountInput.val(), 10);
      var healingRate = parseFloat(healingrateInput.val()) * dinoAmount;
      var maxTime = parseInt(timedurationInput.val(), 10);
      for (var i = 0; i <= maxTime; i++) {
        var totalHpHealed = (i * healingRate);
        dataset.push({X:i,Y:totalHpHealed});
        if (i === maxTime) {
          maxValY = totalHpHealed;
        }
      }
    }
    return {ymax:maxValY,data:dataset};
  },

  // Draws tooltip when mouse hovers Vaggie Cake's heal-over-time graph.
  drawVeggieCakeHealOverTimeTooltip : function (e, config) {
    'use strict';

    var mouseX = parseInt(e.clientX - config.offsetX, 10);
    var hit = false;
    for (var i = 0; i < config.dots.length; i++) {
      var dx = mouseX - config.dots[i].x;
      if (dx > -3 && dx < 3) {
        var dxNext = -1;
        if ((i + 1) < config.dots.length) {
          dxNext = mouseX - config.dots[i + 1].x;
        }
        var nbDino = $('#' + config.graphElemIDs.dinoAmountInputID).val();
        var totalHealed = (config.dots[i].valX * $('#' + config.graphElemIDs.healingRateInputID).val() * nbDino);
        var healedPerDino = (totalHealed / nbDino);
        var nbVeggieCakes = (i === 0 ? 0 : (Math.round(((i / 30) + Number.EPSILON) * 100) / 100));
        config.tipCanvas.style.left = (config.dots[i].x + config.graphDimensions.tooltipMarginLeft) + 'px';
        config.tipCanvas.style.top = (config.dots[i].y + config.graphDimensions.tooltipMarginBottom) + 'px';
        config.tipCanvas.style.display = 'block';
        config.tipCtx.clearRect(0, 0, config.tipCanvas.width, config.tipCanvas.height);
        config.tipCtx.font = config.graphStyle.tooltipFont;
        config.tipCtx.fillStyle = config.graphStyle.tooltipFontColor;
        config.tipCtx.fillText(config.dots[i].valX + ' Seconds', 5, 15);
        config.tipCtx.fillText(config.dots[i].valY + ' Total HP healed', 5, 30);
        config.tipCtx.fillText(healedPerDino + ' HP healed/dino', 5, 45);
        config.tipCtx.fillText(nbVeggieCakes + ' Veggie cakes/dino', 5, 60);
        hit = true;
      }
    }
    if (!hit) {
      config.tipCanvas.style.display = 'none';
      config.tipCanvas.style.left = '-4000px';
    }
  },

  // Function to draw Veggie Cake's heal-over-time graph.
  drawVeggieCakeHealOverTimeGraph : function (healOverTimeGraphDivID) {
    'use strict';

    // Create new IDs storage object.
    var elemIDs = new lineGraphNamespace.graphElementsIDs();
    elemIDs.healOverTimeGraphDivID = healOverTimeGraphDivID;
    elemIDs.graphCanvasID = 'veggieCakeHealOverTimeGraphCanvas';
    elemIDs.tipCanvasID = 'veggieCakeHealOverTimeTipCanvas';
    elemIDs.healingRateInputID = 'lcVeggieCakeHealingRateInput';
    elemIDs.dinoAmountInputID = 'lcVeggieCakeDinoAmountInput';
    elemIDs.timeDurationInputID = 'lcVeggieCakeTimeDurationInput';
    // Get Veggie Cake's heal-over-time graph div.
    var healOverTimeGraphDiv = $('#' + elemIDs.healOverTimeGraphDivID);
    // If Veggie Cake's heal-over-time graph div exists.
    if (!(healOverTimeGraphDiv === undefined || healOverTimeGraphDiv === null) && healOverTimeGraphDiv.length > 0) {
      // Add "healing rate" input.
      healOverTimeGraphDiv.append('<label for="' + elemIDs.healingRateInputID + '" class="veggieCakeLineChartInputLabelStyle">Healing rate: </label>');
      healOverTimeGraphDiv.append('<input type="number" id="' + elemIDs.healingRateInputID + '" name="' + elemIDs.healingRateInputID + '" class="veggieCakeLineChartInputStyle" min="16" max="70" value="70" style="width: 70px;" />&nbsp;&nbsp;');
      // Add "dino amount" input.
      healOverTimeGraphDiv.append('<label for="' + elemIDs.dinoAmountInputID + '" class="veggieCakeLineChartInputLabelStyle">Amount of dinos to heal: </label>');
      healOverTimeGraphDiv.append('<input type="number" id="' + elemIDs.dinoAmountInputID + '" name="' + elemIDs.dinoAmountInputID + '" class="veggieCakeLineChartInputStyle" min="1" max="99" value="1" style="width: 70px;" />&nbsp;&nbsp;');
      // Add "time duration" input.
      healOverTimeGraphDiv.append('<label for="' + elemIDs.timeDurationInputID + '" class="veggieCakeLineChartInputLabelStyle">Max time (seconds): </label>');
      healOverTimeGraphDiv.append('<input type="number" id="' + elemIDs.timeDurationInputID + '" name="' + elemIDs.timeDurationInputID + '" class="veggieCakeLineChartInputStyle" min="1" max="9999" value="900" style="width: 70px;" />');
      // Add canvases.
      veggieCakeGraphsNamespace.addVeggieCakeHealOverTimeCanvases(healOverTimeGraphDiv, elemIDs);
      // Get document elements.
      var graphCanvasElement = $('#' + elemIDs.graphCanvasID);
      var tipCanvasElement = $('#' + elemIDs.tipCanvasID);
      var timeDurationInputElement = $('#' + elemIDs.timeDurationInputID);
      // If canvases exists.
      if (!(graphCanvasElement === undefined || graphCanvasElement === null) && graphCanvasElement.length > 0 &&
          !(tipCanvasElement === undefined || tipCanvasElement === null) && tipCanvasElement.length > 0 &&
          !(timeDurationInputElement === undefined || timeDurationInputElement === null) && timeDurationInputElement.length > 0) {
        // Create new graph style.
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
        // Create new graph dimensions.
        var chartDimensions = new lineGraphNamespace.graphDimensions(
          75,   /* X axis padding left. */
          40,   /* Y axis padding bottom. */
          0,    /* X axis margin right. */
          30,   /* Y axis margin top. */
          -10,  /* X axis title margin left. */
          34,   /* X axis title margin bottom. */
          -160, /* Y axis title margin left. */
          -120, /* Y axis title margin bottom. */
          -75,  /* Tooltip margin left. */
          -50   /* Tooltip margin bottom. */
        );
        // Compute data.
        var chartData = veggieCakeGraphsNamespace.computeVeggieCakeHealOverTimeData(elemIDs);
        // Create new axises configuration.
        var axisesConfig = new lineGraphNamespace.graphAxisesConfig(
          Math.round(parseInt(timeDurationInputElement.val(), 10) / 6), /* Modulo used to defined the amount of X axis graduations to print. */
          Math.round(chartData.ymax / 6), /* Modulo used to defined the amount of Y axis graduations to print. */
          'Time in seconds', /* The X axis title. */
          'Total HP healed' /* The Y axis title. */
        );
        // Create new graph configuration.
        var chartConfig = new lineGraphNamespace.graphConfig(
          elemIDs, /* The various elements IDs. */
          chartData.data, /* The graph dataset. */
          veggieCakeGraphsNamespace.drawVeggieCakeHealOverTimeTooltip, /* A pointer to the function which draws the tooltip. */
          axisesConfig, /* The object containing graph axises configuration. */
          chartDimensions, /* The object containing graph dimensions. */
          chartStyle /* The object containing graph styling. */
        );
        // Bind inputs.
        veggieCakeGraphsNamespace.bindInputsToVeggieCakeHealOverTimeChart(chartConfig, healOverTimeGraphDiv);
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
  veggieCakeGraphsNamespace.drawVeggieCakeHealingRateGraph('veggieCakeHealRateGraph');
  veggieCakeGraphsNamespace.drawVeggieCakeHealOverTimeGraph('veggieCakeHealOverTimeGraph');
});
