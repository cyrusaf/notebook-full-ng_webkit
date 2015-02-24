var fs = require('fs');
var dir = getUserHome() + "/.notebook";
var marked = require( "marked" );
marked.setOptions({
	highlight: function (code) {		
		var highlighted = require('highlight.js').highlightAuto(code).value;
		return highlighted
	}
});

var controllers = angular.module('controllers', []);

controllers.controller('homeController', ['$scope', '$http', '$sce', function ($scope, $http, $sce) {

	// Initialize scope vars
	// ======================
	$scope.notes = [];
	$scope.mode = 0;
	$scope.titleMode = 0;
	$scope.note = "";
	$scope.pureHTML = "";
	$scope.title = "";
	var oldTitle = "";
	$scope.modeString = $sce.trustAsHtml('Edit Note  <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>');

	$scope.newNote = function() {
		// Check if note exists
		if (!fs.existsSync(dir + "/Untitled.txt")) {
			// Create Untitled.txt
			fs.writeFileSync(dir + "/Untitled.txt", '');
			$scope.loadNote("Untitled");
			$scope.loadNotes();
			return
		}

		var j = 1;
		while (fs.existsSync(dir + "/Untitled" + j + ".txt")) {
			j++;
		}
		// Create Untitled + j + .txt
		fs.writeFileSync(dir + "/Untitled" + j + ".txt", '');
		$scope.loadNote("Untitled" + j);
		$scope.loadNotes();
	}
	$scope.saveNote = function() {
		var save_title = $scope.title;
		fs.writeFile(dir + "/" + save_title + ".txt", $scope.note, function(err) {});
	}
	$scope.saveTitle = function() {
		if ($scope.title == "") {
			$scope.title = oldTitle;
			return
		}
		fs.rename(dir + '/' + oldTitle + '.txt', dir + '/' + $scope.title + '.txt', function(err){});
		oldTitle = $scope.title;
		$scope.loadNotes();
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
		$scope.pureHTML = $sce.trustAsHtml(marked($scope.note));
	}
	$scope.loadNote = function(filename) {
		// Don't load if already loaded
		if (filename == $scope.title) {
			return;
		}

		// Save old note
		if ($scope.title != "") {
			$scope.saveNote();
		}
		// Check if new note exists
		if (fs.existsSync(dir + "/" + filename + ".txt")) {

			if ($scope.mode == 1) {
				$scope.toggleMode();
			}

			oldTitle = filename;
			$scope.title = filename;
	        $scope.note = fs.readFileSync(dir + '/' + filename + '.txt', 'utf8');
	        $scope.md_to_html();
		}
	}
	$scope.loadNotes = function() {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		$scope.notes = [];
		var files = fs.readdirSync(dir);
		for (var i = 0; i < files.length; i++) {
			$scope.notes.push(files[i].slice(0,files[i].length - 4));	
		}
	}
	$scope.deleteNote = function() {
		if ($scope.title != "") {
			fs.unlinkSync(dir + '/' + $scope.title + '.txt');
			oldTitle = "";
			$scope.title = ""
;			$scope.loadNotes();
			if ($scope.notes.length > 0) {
				$scope.loadNote($scope.notes[0]);
			}
		}
	}

	// Run on ready
	// =============
	$scope.loadNotes();
	if ($scope.notes.length > 0) {
		$scope.loadNote($scope.notes[0]);
	}

	var gui = require('nw.gui');
	var win = gui.Window.get();
	win.on('close', function() {
		this.hide();
		if ($scope.note != "") {
			$scope.saveNote();
		}
		this.close(true)
;	});
}]);



function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}