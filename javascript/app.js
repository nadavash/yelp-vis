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
                .domain([Math.exp(0), Math.exp(100)])
                .range([0, 10]);

            var overlay = new maps.OverlayView();
            overlay.onAdd = function() {
                var map = $scope.map.control.getGMap();

                var layer = d3.select(this.getPanes().overlayLayer)
                    .append('svg')
                    .attr('class', 'stations');

                var originalBounds = map.getBounds();
                var origZoom = $scope.map.zoom;

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

                    var currZoom = origZoom - map.getZoom();
                    var zoomFactor = Math.pow(2, currZoom);
                    var viewBox = {
                        x: (sw.x - origSw.x) * zoomFactor,
                        y: (ne.y - origNe.y) * zoomFactor,
                        width: (ne.x - sw.x) * zoomFactor,
                        height: (sw.y - ne.y) * zoomFactor
                    };

                    layer.style('left', sw.x + 'px')
                        .style('top', ne.y + 'px')
                        .style('width', (ne.x - sw.x) + 'px')
                        .style('height', (sw.y - ne.y) + 'px')
                        .attr('viewBox', viewBox.x + ' ' + viewBox.y + ' '
                            + viewBox.width + ' ' + viewBox.height);

                    var marker = layer.selectAll('circle')
                        .data(data['18-6'].splice(0, 2000))
                        .each(transform)
                        .enter().append('circle')
                        .each(transform)
                        .attr('class', 'marker')
                        .attr('r', function(d) { return logScale(Math.exp(d)); })

                    function transform(d, index) {
                        d = logScale(Math.exp(d));
                        geoloc = new maps.LatLng(
                            data.businesses[index].latitude,
                            data.businesses[index].longitude);
                        screenPos = projection.fromLatLngToDivPixel(geoloc);
                        return d3.select(this)
                            .attr('cx', screenPos.x + 'px')
                            .attr('cy', screenPos.y + 'px');
                    }
                };

                map.addListener('center_changed', overlay.draw);
            };
            overlay.setMap($scope.map.control.getGMap());
        });
    });
});
