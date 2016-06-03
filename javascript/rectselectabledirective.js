/// <reference path="../typings/index.d.ts" />
'use strict';

app.directive('rectSelectable', function() {
    return {
        scope: false,
        link: function(scope, elem) {
            var selectionRect = null;

            scope.$watch('selectionBounds', function(newVal) {
                if (selectionRect === null) {
                    return;
                }
                selectionRect.setBounds(scope.selectionBounds);
            }, true);

            // Setup draggable rectangle.
            scope.uiGmapIsReady.promise(1).then(function(instances) {
                var map = instances[0].map;
                var strokeOpacity = 0.8;
                var fillOpacity = 0.3;
                var dragging = false;
                var rect;
                var latlng1, latlng2;

                selectionRect = new google.maps.Rectangle({
                    map: map,
                    strokeColor: '#0000FF',
                    strokeOpacity: strokeOpacity,
                    fillColor: '#0000FF',
                    fillOpacity: fillOpacity
                });

                google.maps.event.addListener(map, 'mousedown', function(mEvent) {
                    console.log('here');
                    map.draggable = false;
                    latlng1 = mEvent.latLng;
                    dragging = true;
                    selectionRect.strokeOpacity = strokeOpacity;
                    selectionRect.fillOpacity = fillOpacity;
                });

                google.maps.event.addListener(map, 'mousemove', function(mEvent) {
                    latlng2 = mEvent.latLng;
                    updateBounds();
                });

                google.maps.event.addListener(map, 'mouseup', function(mEvent) {
                    map.draggable = true;
                    dragging = false;
                    console.log(mEvent);
                    if (mEvent.which === 3) {
                        scope.showAdvanced();
                    }
                });

                google.maps.event.addListener(selectionRect, 'mouseup', function(data){
                    map.draggable = true;
                    dragging = false;
                    scope.showAdvanced();
                });

                function updateBounds() {
                    if (dragging){
                        var latLngBounds = getSelectionBounds();
                        selectionRect.setBounds(latLngBounds);
                        scope.selectionBounds = latLngBounds;
                    }
                }

                function getSelectionBounds() {
                    var lat1 = latlng1.lat();
                    var lat2 = latlng2.lat();
                    var minLat = lat1<lat2?lat1:lat2;
                    var maxLat = lat1<lat2?lat2:lat1;
                    var lng1 = latlng1.lng();
                    var lng2 = latlng2.lng();
                    var minLng = lng1<lng2?lng1:lng2;
                    var maxLng = lng1<lng2?lng2:lng1;
                    return new google.maps.LatLngBounds(
                        { lat: minLat, lng: minLng},
                        { lat: maxLat, lng: maxLng });
                }
            });
        }
    }
});