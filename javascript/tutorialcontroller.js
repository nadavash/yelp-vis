/// <reference path="../typings/index.d.ts" />
'use strict';

app.controller('TutorialController', function($scope, $sce) {
    var tutorialContent = [
        `<p>Looking for a new place to live or travel can be a daunting task.
        You could easily get lost in a sea of information without getting a good
        sense for what a place is like. To help in solving this problem, we
        built this tool to help you understand the breakdown of activity in
        cities using business data from Yelp!</p>
        <p>We are trying to answer 2 basic questions:</p>
        <h3>
            What is the most active section/neighborhood of Las Vegas at
            any given time?
        </h3>
        <h3>
            At what time is a section/neighborhood most active?
        </h3>`
        ,
        `<h2>1. Select a time</h2>
        <p>
            To begin, select a date and time from the time selector
            at the bottom right of the map.
        </p>`,
        `<h2>2. Explore checkin activity</h2>
        <p>
            Each red bubble on the screen is a business on Yelp. The
            size of the bubble represents the relative number of
            checkins at that business at the time selected. Pan
            around the map by clicking and dragging the mouse on the
            map view.
        </p>`,
        `<h2>3. Select a place</h2>
        <p>
            Interested in some more details about the Las Vegas
            strip? You can right click and drag the mouse on an
            area of the map to create a rectangular selection. This
            will pop up a dialog with specific information about
            the businesses in this area, and the weekly activity in that
            section of the city.
            <em>Try selecting the Las Vegas strip and see what you get!</em>
        </p>`,
        `<h2>4. Keep exploring for yourself!</h2>
        <p>
            And have fun.
        </p>`
    ];

    $scope.numSteps = tutorialContent.length;

    $scope.tutorialStep = 0;

    $scope.$watch('tutorialStep', function() {
        $scope.tutorialContent = $sce.trustAsHtml(tutorialContent[$scope.tutorialStep]);
    }, true);

    $scope.next = function() {
        $scope.tutorialStep = Math.min(tutorialContent.length - 1, $scope.tutorialStep + 1);
        console.log('here');
    };

    $scope.previous = function() {
        $scope.tutorialStep = Math.max(0, $scope.tutorialStep - 1);
    };
});
