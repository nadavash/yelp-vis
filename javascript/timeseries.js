/// <reference path="../typings/index.d.ts" />
'use strict';

// Returns a time series chart function that can be used to generate a reusable
// time series svg visualization.
function timeSeries() {
    var TRANSITION_DURATION = 1500;
    var data = [];
    var width = 640;
    var height = 480;
    var backgroundColor = 'white';
    var lineColor = 'red';
    var padding = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };

    var xScale, yScale;


    // Chart generation closure.
    var chart = function(selection) {
        selection.each(function(data) {
            var container = d3.select(this);
            var svg = container.selectAll('svg').data([data]);

            var svgEnter = svg.enter()
                .append('svg')
                .attr('class', 'time-series');

            svg.attr('width', width)
                .attr('height', height)
                .style('background-color', backgroundColor);

            svgEnter.append('g')
                .attr('class', 'points-container')
                .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
                .append('path')
                .attr('class', 'value line');

            svgEnter.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(' + padding.left + ',' + (height - padding.top) + ')');

            svgEnter.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

            svgEnter.append('g')
                .attr('class', 'x text')
                .attr('transform', 'translate(' + (padding.left + innerWidth()/2) + ',' + (innerHeight() + padding.top + 30) + ')')
                .attr('class', 'chart-title')
                .text('time');

            svgEnter.append('g')
                .attr('class', 'y text')
                .attr('transform', 'translate(' + (padding.left - 30) + ',' + (height/2) + ') rotate(-90)')
                .attr('class', 'chart-title')
                .text('counts');

            setScales(data);
            setAxes(container.select('.x.axis'),
                    container.select('.y.axis'));
            var adjustedWidth = innerWidth();
            var adjustedHeight = innerHeight();

            var points = svg.select('.points-container')
                .selectAll('circle').data(data);

            points.enter().append('circle')
                .attr('r', 3)
                .attr('cx', function(d) { return xScale(d.date); })
                .attr('cy', function(d) { return yScale(d.frequency); })
                .style('opacity', 0.7)
                .attr('fill', lineColor);


            points.exit().remove();

            points.transition()
                .attr('cx', function(d) { return xScale(d.date); })
                .attr('cy', function(d) { return yScale(d.frequency); });

            container.select('.value.line')
                .transition()
                .attr('d', valueLine(data))
                .attr('stroke', lineColor);
        });
    };

    // Gets/sets the data associated with this chart.
    chart.data = function(val) {
        if (!arguments.length) return data;
        data = val;
        if (typeof updateData === 'function') {
            updateData();
        }
    };

    // Gets/sets the width of this chart.
    chart.width = function(val) {
        if (!arguments.length) return width;

        width = val;
        return this;
    };

    // Gets/sets the height of this chart.
    chart.height = function(val) {
        if (!arguments.length) return height;

        height = val;
        return this;
    };

    // Gets/sets the background color of this chart.
    chart.backgroundColor = function(val) {
        if (!arguments.length) return backgroundColor;

        backgroundColor = val;
        return this;
    }

    // Returns the width of the chart, excluding the paddings.
    var innerWidth = function() {
        return width - padding.left - padding.right;
    };

    // Returns the height of the chart, excluding the paddings.
    var innerHeight = function() {
        return height - padding.top - padding.bottom;
    };

    var setScales = function(data) {
        xScale = d3.time.scale()
            .domain([data[0].date, data[data.length - 1].date])
            .range([0, innerWidth()]);

        var yMin = d3.min(data, function(d) { return d.frequency });
        var yMax = d3.max(data, function(d) { return d.frequency });

        yScale = d3.scale.linear()
            .domain([yMin * 0.9, yMax])
            .range([innerHeight(), 0]);
    };

    var setAxes = function(xAxisLabel, yAxisLabel) {
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .tickFormat(d3.time.format('%a'))
            .ticks(7);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        xAxisLabel.transition().duration(TRANSITION_DURATION).call(xAxis);

        yAxisLabel.transition().duration(TRANSITION_DURATION).call(yAxis);
    };

    var valueLine = d3.svg.line()
        .x(function (d) { return xScale(d.date); })
        .y(function (d) { return yScale(d.frequency); });

    return chart;
}
