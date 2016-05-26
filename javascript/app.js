/// <reference path="../typings/index.d.ts" />

var app = angular.module('yelpVis', ['ngMaterial', 'uiGmapgoogle-maps'])
    .config(function($mdThemingProvider, uiGmapGoogleMapApiProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('red')
            .accentPalette('grey');

        uiGmapGoogleMapApiProvider.configure({
            libraries: 'geometry,visualization'
        });
    });

// The main controller for the application.
app.controller('MainController', function($scope, uiGmapGoogleMapApi) {
    // Share google maps api for directives in this controller.
    $scope.uiGmapGoogleMapApi = uiGmapGoogleMapApi;

    $scope.map = {
        center: { latitude: 36.1699, longitude: -115.1398 },
        zoom: 12,
        control: {}
    };

});

app.directive('yelpVisOverlay', function() {
    return {
        scope: false,
        link: function(scope, elem) {
            var map = null;
            var originalBounds = null;
            var originalZoom = null;
            var dataBound = false;

            // TODO(nadavash): listen for data changes on the scope to change
            // bubble map visualization.

            // Initialized overlay when the API is finished loading.
            scope.uiGmapGoogleMapApi.then(function(maps) {
                // Set the map reference for this directive.

                // Create the map overlay for layering custom SVG elements on top of the
                // map.
                d3.json('/data/checkins.json', function(err, data) {
                    if (err) throw err;

                    map = scope.map.control.getGMap();


                    var checkinsMap = new bubbleMap()
                        .minBubbleRadius(0)
                        .maxBubbleRadius(50)
                        .transitionDuration(2000);

                    var overlay = new maps.OverlayView();
                    overlay.onAdd = function() {
                        originalBounds = map.getBounds();
                        originalZoom = map.getZoom();
                    }

                    overlay.draw = function() {
                        var projection = overlay.getProjection();

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

                        if (!dataBound) {
                            var datum = {
                                projection: projection,
                                // locations: data.businesses,
                                // sizes: data['18-6'].slice(0,5000),
                                maps: maps
                            };

                            var locations = [];
                            var sizes = data['18-6'].filter(function(val, i) {
                                if (val > 0) {
                                    locations.push(data.businesses[i]);
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                            datum.locations = locations;
                            datum.sizes = sizes;

                            d3.select(overlay.getPanes().overlayLayer)
                                .datum(datum)
                                .call(checkinsMap);

                            dataBound = true;
                        }

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
            });
        }
    };
});
