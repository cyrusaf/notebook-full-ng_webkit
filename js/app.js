var app = angular.module('app', [
  'ngRoute',
  'controllers'
]);

app.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
		when('/', {
			templateUrl: 'partials/homePartial.html',
			controller: 'homeController'
		}).
		otherwise({
			redirectTo: '/'
		});
  	}
]);

app.directive('focusOn', function($timeout, $parse) {
	return {
		link: function(scope, element, attrs) {
			var model = $parse(attrs['focusOn']);
			scope.$watch(model, function(value) {
				if (value == 1) {
					$timeout(function() {
						element[0].focus();
					});
				}
			})
		}
	}
});