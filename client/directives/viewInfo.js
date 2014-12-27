angular.module('swot').directive('viewinfo', function ($sce) {
    return {
        restrict: 'E',
        templateUrl: '/partials/viewInfo.html',
        scope: {
            info: '='
        },
        link: function (scope, elem, attrs) {
            scope.trusted = function (html) {
                return $sce.trustAsHtml(html);
            };
        }
    };
});
