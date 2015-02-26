var fs = require('fs');
var path = require('path');
var dir = getUserHome() + "/.notebook";
var marked = require( "marked" );
marked.setOptions({
	highlight: function (code) {		
		var highlighted = require('highlight.js').highlightAuto(code).value;
		return highlighted
	}
});

var gui = require('nw.gui');
var win = gui.Window.get();

var controllers = angular.module('controllers', []);

controllers.controller('homeController', ['$scope', '$http', '$sce', function ($scope, $http, $sce) {

	// Initialize scope vars
	// ======================
	$scope.notes = [];
	$scope.mode = 0;
	$scope.titleMode = 0;
	$scope.nodebookMode = false;
	$scope.note = "";
	$scope.pureHTML = "";
	$scope.title = "";
	var oldTitle = "";
	$scope.modeString = $sce.trustAsHtml('Edit Note  <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>');

	// Sidebar
	// ========
	$scope.sidebar = {};
	$scope.sidebar.mode = 'notebooks';
	$scope.sidebar.changeMode = function() {
		if ($scope.sidebar.mode == 'notebooks') {
			$scope.sidebar.mode = 'notes';
		} else {
			$scope.sidebar.mode = 'notebooks';
		}
	}
	$scope.sidebar.notebooks = ['test', 'test2'];
	$scope.sidebar.getNotebooks = function() {
		$scope.sidebar.notebooks = getDirectories(dir);
	}
	$scope.sidebar.init = function() {
		// Get list of notebooks
		$scope.sidebar.getNotebooks();
		// Load first note of first notebook
	}

	// Notebook
	// =========
	$scope.notebook = {};
	$scope.notebook.title = "";
	$scope.notebook.load = function(filename) {
		// Check if notebook exists
		if (fs.existsSync(dir + "/" + filename)) {
			$scope.sidebar.mode = 'notes';
			$scope.notebook.title = filename;
			console.log("Notebook: " + $scope.notebook.title);
			// Reload notes
			$scope.loadNotes(filename);
		}
	};
	$scope.notebook.new = function() {
		// Check if note exists
		if (!fs.existsSync(dir + "/" + 'Untitled')) {
			// Create Untitled.txt
			fs.mkdirSync(dir + "/" + 'Untitled');
			$scope.sidebar.getNotebooks();
			$scope.notebook.load("Untitled");
			$scope.newNote("Untitled");
			return
		}

		var j = 1;
		while (fs.existsSync(dir + "/" + 'Untitled' + j)) {
			j++;
		}
		fs.mkdirSync(dir + "/" + 'Untitled' + j);
		$scope.sidebar.getNotebooks();
		$scope.notebook.load("Untitled" + j);
		$scope.newNote("Untitled");
	}

	// Note
	// =====
	$scope.noteObj = {};
	$scope.noteObj.notebook_title = "";

	$scope.newNote = function() {
		// Check if note exists
		if (!fs.existsSync(dir + "/" + $scope.notebook.title + "/Untitled.txt")) {
			// Create Untitled.txt
			fs.writeFileSync(dir + "/" + $scope.notebook.title + "/Untitled.txt", '');
			$scope.loadNote("Untitled");
			$scope.loadNotes($scope.notebook.title);
			return
		}

		var j = 1;
		while (fs.existsSync(dir + "/" + $scope.notebook.title + "/Untitled" + j + ".txt")) {
			j++;
		}
		// Create Untitled + j + .txt
		fs.writeFileSync(dir + "/" + $scope.notebook.title + "/Untitled" + j + ".txt", '');
		$scope.loadNote("Untitled" + j);
		$scope.loadNotes($scope.notebook.title);
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
		$scope.loadNotes($scope.notebook.title);
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
	$scope.toggleNotebookMode = function() {
		if ($scope.notebookMode) {
			$scope.notebookMode = false;
		} else {
			$scope.notebookMode = true;
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
		if (fs.existsSync(dir + "/" + $scope.notebook.title + "/" + filename + ".txt")) {

			if ($scope.mode == 1) {
				$scope.toggleMode();
			}

			oldTitle = filename;
			$scope.title = filename;
			$scope.noteObj.notebook_title = $scope.notebook.title;
	        $scope.note = fs.readFileSync(dir + '/' + filename + '.txt', 'utf8');
	        $scope.md_to_html();
		}
	}
	$scope.loadNotes = function(notebook) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		$scope.notes = [];
		var files = fs.readdirSync(dir + "/" + notebook);
		for (var i = 0; i < files.length; i++) {
			if (files[i].slice(files[i].length - 4, files[i].length) != '.txt') {
				$scope.notebooks.push({name: files[i]});
				continue;
			}
			$scope.notes.push(files[i].slice(0,files[i].length - 4));	
		}
	}
	$scope.deleteNote = function() {
		if ($scope.title != "") {
			fs.unlinkSync(dir + '/' + $scope.title + '.txt');
			oldTitle = "";
			$scope.title = "";
			$scope.loadNotes();
			if ($scope.notes.length > 0) {
				$scope.loadNote($scope.notes[0]);
			}
		}
	}
	$scope.addTab = function(start, end) { 
		$scope.note = $scope.note.substring(0, start) + "\t" + $scope.note.substring(end);
		$scope.md_to_html();
	}
	$scope.closeWindow = function() {
		win.close();
	}
	$scope.hideWindow = function() {
		win.minimize();
	}
	$scope.fullWindow = function() {
		win.maximize();
	}

	// Run on ready
	// =============
	$scope.sidebar.init();

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

function getDirectories(srcpath) {
	console.log(srcpath);
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}