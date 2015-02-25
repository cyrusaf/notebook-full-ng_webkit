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

app.directive('ngTab', function() {
        return {
            link: function(scope, element, attrs) {
            	element.bind("keydown keypress", function(event) {
	                if(event.which === 9) {
	                	event.preventDefault();
	                	var start = element[0].selectionStart;
	                	var end   = element[0].selectionEnd;
	                	scope.$apply(function() {
	                		scope.addTab(start, end);
	                		var textarea = element[0];
	                		textarea.setSelectionRange(0,0);
	                	});
	                }
	            });
            }
        }
    });