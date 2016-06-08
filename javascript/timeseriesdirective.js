/// <reference path="../typings/index.d.ts" />
'use strict';

app.directive('timeSeries', function() {
    return {
        restrict: 'E',
        scope: { data: '=chartData' },
        link: function(scope, elem) {
            var myTimeSeries = timeSeries()
                .width(640)
                .height(300);

            d3.select(elem[0])
                .datum(scope.data)
                .call(myTimeSeries);
        }
    };
});
