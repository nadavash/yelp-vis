/// <reference path="../typings/index.d.ts" />
'use strict';

app.controller('BusinessDialogController', function($scope, $mdDialog) {
    $scope.close = function() {
        $mdDialog.hide();
    }

    var bounds = $scope.$$prevSibling.selectionBounds;

    // Find all bussinesses within geolocation...
    var selectedBusinesses = $scope.$$prevSibling.businessData.filter(
        function(value) {
            return value.latitude >= bounds.H.H &&
                   value.latitude <= bounds.H.j &&
                   value.longitude <= bounds.j.H &&
                   value.longitude >= bounds.j.j;

        });

    $scope.numBusinesses = selectedBusinesses.length;
    $scope.avgRating = d3.mean(selectedBusinesses, function(d) {
            return d.stars;
        });

    $scope.topBusinesses = selectedBusinesses.sort(function(a, b) {
            return b.review_count - a.review_count;
        }).slice(0, 100)
        .sort(function(a, b) {
            return b.stars - a.stars;
        }).slice(0, 5);
});
