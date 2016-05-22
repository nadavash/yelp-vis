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
    $scope.map = {
        center: { latitude: 37.76487, longitude: -122.41948 },
        zoom: 8,
        control: {}
    };

    uiGmapGoogleMapApi.then(function(maps) {

        // Create the map overlay for layering custom SVG elements on top of the
        // map.
        d3.json('data/stations.json', function(err, data) {
            if (err) throw err;

            var overlay = new maps.OverlayView();
            overlay.onAdd = function() {
                var layer = d3.select(this.getPanes().overlayLayer)
                    .append('div')
                    .attr('class', 'stations');

                overlay.draw = function() {
                    var projection = this.getProjection();
                    var padding = 10;

                    var marker = layer.selectAll('svg')
                        .data(d3.entries(data))
                        .each(transform)
                        .enter().append('svg')
                        .each(transform)
                        .attr('class', 'marker');

                    marker.append('circle')
                        .attr('r', 4.5)
                        .attr('cx', padding)
                        .attr('cy', padding);

                    marker.append('text')
                        .attr('x', padding + 7)
                        .attr('y', padding)
                        .attr('dy', '.31em')
                        .text(function(d) { return d.key; });

                    function transform(d) {
                        d = new maps.LatLng(d.value[1], d.value[0]);
                        d = projection.fromLatLngToDivPixel(d);
                        return d3.select(this)
                            .style('left', (d.x - padding) + 'px')
                            .style('top', (d.y - padding) + 'px');
                    }
                };
            };
            overlay.setMap($scope.map.control.getGMap());
        });
    });
});
