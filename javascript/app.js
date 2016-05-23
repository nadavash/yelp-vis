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
        center: { latitude: 36.1699, longitude: -115.1398 },
        zoom: 12,
        control: {}
    };

    uiGmapGoogleMapApi.then(function(maps) {

        // Create the map overlay for layering custom SVG elements on top of the
        // map.
        d3.json('/data/checkins.json', function(err, data) {
            if (err) throw err;

            var logScale = d3.scale.log()
                .base(Math.E)
                .domain([Math.exp(0), Math.exp(50)])
                .range([4, 10]);

            var overlay = new maps.OverlayView();
            overlay.onAdd = function() {
                var layer = d3.select(this.getPanes().overlayLayer)
                    .append('div')
                    .attr('class', 'stations');
                overlay.draw = function() {
                    var projection = this.getProjection();

                    var marker = layer.selectAll('svg')
                        .data(data['18-6'].splice(0, 500))
                        .each(transform)
                        .enter().append('svg')
                        .each(transform)
                        .attr('class', 'marker')
                        .style('width', function(d) { logScale(d) * 2; })
                        .style('height', function(d) { logScale(d) * 2; });

                    marker.append('circle')
                        .attr('r', function(d) { return logScale(Math.exp(d)); })
                        .attr('cx', function(d) { return logScale(Math.exp(d)); })
                        .attr('cy', function(d) { return logScale(Math.exp(d)); });

                    // marker.append('text')
                    //     .attr('x', padding + 7)
                    //     .attr('y', padding)
                    //     .attr('dy', '.31em')
                    //     .text(function(d) { return d.key; });

                    function transform(d, index) {
                        d = logScale(Math.exp(d));
                        geoloc = new maps.LatLng(
                            data.businesses[index].latitude,
                            data.businesses[index].longitude);
                        screenPos = projection.fromLatLngToDivPixel(geoloc);
                        return d3.select(this)
                            .style('left', (screenPos.x - d) + 'px')
                            .style('top', (screenPos.y - d) + 'px');
                    }
                };
            };
            overlay.setMap($scope.map.control.getGMap());
        });
    });
});
