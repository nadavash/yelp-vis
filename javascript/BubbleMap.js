/// <reference path="../typings/index.d.ts" />

// Returns a bubble map chart function that can be used to generate a reusable
// bubble map that overlays on top of the Google Map API.
function bubbleMap() {
    // User-editable attributes
    var width = 800,
        height = 600,
        minBubbleRadius = 0,
        maxBubbleRadius = 10,
        fillColor = '#c41200',
        transitionDuration = 750;

    var chart = function(selection) {
        selection.each(function(data) {
            // Prepare the scales
            var bubbleRadiusScale = d3.scale.linear()
                .domain([d3.min(data.sizes), d3.max(data.sizes)])
                .range([minBubbleRadius, maxBubbleRadius])

            var svg = d3.select(this)
                .selectAll('svg')
                .data([data])

            svg.enter()
                .append('svg')
                .attr('class', 'bubble-map');

            svg.attr('width', width)
                .attr('height', height);

            var bubbles = svg.selectAll('circle').data(data.sizes);

            bubbles.enter().append('circle')
                .each(transform)
                .attr('fill', fillColor)
                .attr('class', 'bubble')
                .attr('r', 0);

            bubbles.transition()
                .delay(function(_, i) { return i; })
                .duration(transitionDuration)
                .attr('r', function(d) { return bubbleRadiusScale(d); })


            function transform(d, i) {
                var bubbleRadius = bubbleRadiusScale(d);
                var geoLocation = new data.maps.LatLng(
                    data.locations[i].latitude,
                    data.locations[i].longitude);
                var screenPos =
                    data.projection.fromLatLngToDivPixel(geoLocation);

                return d3.select(this)
                    .attr('cx', screenPos.x + 'px')
                    .attr('cy', screenPos.y + 'px');
            }
        });
    };

    // Gets/sets the width of this bubble map.
    chart.width = function(val) {
        if (arguments.length === 0) {
            return width;
        }
        width = val;
        return this;
    }

    // Gets/sets the height of this bubble map.
    chart.height = function(val) {
        if (arguments.length === 0) {
            return height;
        }
        height = val;
        return this;
    }

    // Gets/sets the minimum bubble radius for this bubble map.
    chart.minBubbleRadius = function(val) {
        if (arguments.length === 0) {
            return minBubbleRadius;
        }
        minBubbleRadius = val;
        return this;
    }

    // Gets/sets the maximum bubble radius for this bubble map.
    chart.maxBubbleRadius = function(val) {
        if (arguments.length === 0) {
            return maxBubbleRadius;
        }
        maxBubbleRadius = val;
        return this;
    }

    // Gets/sets the bubble fill color.
    chart.fillColor = function(val) {
        if (arguments.length === 0) {
            return fillColor;
        }
        fillColor = val;
        return this;
    }

    // Gets/sets the trasition duration for animations for this bubble map.
    chart.transitionDuration = function(val) {
        if (arguments.length === 0) {
            return transitionDuration;
        }
        transitionDuration = val;
        return this;
    }

    return chart;
}
