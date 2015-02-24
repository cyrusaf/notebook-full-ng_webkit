var fs = require('fs');
var dir = getUserHome() + "/.notebook"

var controllers = angular.module('controllers', []);

controllers.controller('homeController', ['$scope', '$http', '$sce', function ($scope, $http, $sce) {

	// Initialize scope vars
	// ======================
	$scope.notes = [];
	$scope.mode = 0;
	$scope.titleMode = 0;
	$scope.note = "";
	$scope.pureHTML = "";
	$scope.title = "Untitled";
	var oldTitle = "Untitled";
	$scope.modeString = $sce.trustAsHtml('Edit Note  <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>');

	$scope.saveNote = function() {
		fs.writeFile(dir + "/" + $scope.title + ".txt", $scope.note, function(err) {});
	}
	$scope.saveTitle = function() {
		fs.rename(dir + '/' + oldTitle + '.txt', dir + '/' + $scope.title + '.txt', function(err){});
	}
	$scope.toggleMode = function() {
		if ($scope.mode == 0) {
			$scope.mode = 1;
			if ($scope.title == "Untitled") {
				$scope.title == "";
			}
			$scope.modeString = $sce.trustAsHtml('View Note  <span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>');
		} else {
			$scope.md_to_html();
			$scope.mode = 0;
			if ($scope.title == "") {
				$scope.title = "Untitled";
			}
			$scope.modeString = $sce.trustAsHtml('Edit Note  <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>');
		}
	}
	$scope.toggleTitleMode = function() {
		if ($scope.titleMode == 0) {
			$scope.titleMode = 1;
		} else {
			$scope.saveTitle();
			$scope.titleMode = 0;
		}
	}
	$scope.md_to_html = function() {
		var marked = require( "marked" );
		$scope.pureHTML = $sce.trustAsHtml(marked($scope.note));
	}
	$scope.loadNote = function(filename) {
		// Check if note exists
		if (fs.existsSync(dir + "/" + filename + ".txt")) {
			oldTitle = filename;
			$scope.title = filename;
	        $scope.note = fs.readFileSync(dir + '/' + filename + '.txt', 'utf8');
	        $scope.md_to_html();
		}
	}

	// Run on ready
	// =============

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	var files = fs.readdirSync(dir);
	for (var i = 0; i < files.length; i++) {
		$scope.notes.push(files[i].slice(0,files[i].length - 4));	
	}

	console.log($scope.notes);

	$scope.loadNote('Untitled');

	

}]);



function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}