/// <reference path="../typings/index.d.ts" />
'use strict';

app.directive('yelpVisOverlay', function() {
    return {
        scope: false,
        link: function(scope, elem) {
            var map = null;
            var originalBounds = null;
            var originalZoom = null;
            var overlay = null;

            var checkinsMap = new bubbleMap()
                .minBubbleRadius(1.5)
                .maxBubbleRadius(25)
                .transitionDuration(500);

            // Initialized overlay when the API is finished loading.
            scope.uiGmapIsReady.promise(1).then(function(instances) {
                // Set the map reference for this directive.

                // Create the map overlay for layering custom SVG elements on top of the
                // map.
                map = instances[0].map;

                overlay = new google.maps.OverlayView();
                overlay.onAdd = function() {
                    originalBounds = map.getBounds();
                    originalZoom = map.getZoom();
                }

                overlay.draw = function() {
                    var projection = overlay.getProjection();

                    if (projection === undefined) {
                        return;
                    }

                    var sw = projection.fromLatLngToDivPixel(
                        map.getBounds().getSouthWest());
                    var ne = projection.fromLatLngToDivPixel(
                        map.getBounds().getNorthEast());

                    var origSw = projection.fromLatLngToDivPixel(
                        originalBounds.getSouthWest());
                    var origNe = projection.fromLatLngToDivPixel(
                        originalBounds.getNorthEast());

                    checkinsMap.width(ne.x - sw.x)
                        .height(sw.y - ne.y);

                    var svgLayer = d3.select(overlay.getPanes().overlayLayer)
                        .select('svg');

                    var currZoom = originalZoom - map.getZoom();
                    var zoomFactor = Math.pow(2, currZoom);
                    var viewBox = {
                        x: (sw.x - origSw.x) * zoomFactor,
                        y: (ne.y - origNe.y) * zoomFactor,
                        width: (ne.x - sw.x) * zoomFactor,
                        height: (sw.y - ne.y) * zoomFactor
                    };

                    svgLayer.style('left', sw.x + 'px')
                        .style('top', ne.y + 'px')
                        .style('width', (ne.x - sw.x) + 'px')
                        .style('height', (sw.y - ne.y) + 'px')
                        .attr('viewBox', viewBox.x + ' ' + viewBox.y + ' '
                            + viewBox.width + ' ' + viewBox.height);
                };

                overlay.setMap(scope.map.control.getGMap());

                map.addListener('bounds_changed', overlay.draw);
            });

            scope.$watch('checkinData', function(checkinData) {
                if (checkinData === null) {
                    return;
                }

                overlay.draw();

                var datum = {
                    projection: overlay.getProjection(),
                    locations: checkinData.locations,
                    sizes: checkinData.sizes,
                    maps: google.maps
                };

                d3.select(overlay.getPanes().overlayLayer)
                    .datum(datum)
                    .call(checkinsMap);

                overlay.draw();
            }, true);
        }
    };
});
