
pg.document = function() {
	var center;
	var clipboard = [];

	
	var setup = function() {
		paper.view.center = new paper.Point(0,0);
		center = paper.view.center;
		
		// call DocumentUpdate at a reduced rate (every tenth frame)
		var int = 10;
		paper.view.onFrame = function() {
			if(int > 0) {
				int--;
			} else {
				jQuery(document).trigger('DocumentUpdate');
				int = 10;
			}
		};
	};
	
	
	var clear = function() {
		paper.project.clear();
		pg.undo.clear();
		setup();
		pg.layer.setup();
	};
	
	
	var getCenter = function() {
		return center;
	};
	
	
	var getClipboard = function() {
		return clipboard;	
	};
	
	
	var pushClipboard = function(item) {
		clipboard.push(item);
		return true;
	};
	
	
	var clearClipboard = function() {
		clipboard = [];
		return true;
	};

	
	var loadJSONDocument = function(file) {
		paper.project.clear();
		pg.toolbar.setDefaultTool();
		pg.export.setExportRect();
		
		jQuery.getJSON( file, function( data ) {
			paper.project.importJSON(data);
			jQuery.each(paper.project.layers, function(index, layer) {
				jQuery.each(layer.children, function(index, obj) {
					if(obj && obj.data && obj.data.isExportRect) {
						pg.export.setExportRect(new paper.Rectangle(obj.data.exportRectBounds));
					}
				});
			});
			pg.layerPanel.updateLayerList();
			paper.view.update();
			pg.undo.snapshot('loadJSONDocument');

		});
	};

	
	var saveJSONDocument = function() {
		var fileName = prompt("Name your file", "export.json");

		if (fileName !== null) {
			pg.hover.clearHoveredItem();
			
			// backup guide items, then remove them before export
			var guideItems = pg.guides.getAllGuides();
			pg.guides.removeAllGuides();
			
			var fileNameNoExtension = fileName.split(".json")[0];
			var exportData = paper.project.exportJSON({ asString: true });
			var blob = new Blob([exportData], {type: "text/json"});
			saveAs(blob, fileNameNoExtension+'.json');
			
			// restore guide items after export
			pg.layer.getGuideLayer().addChildren(guideItems);
		}
	};
	
	
	
	return {
		getCenter: getCenter,
		setup: setup,
		clear: clear,
		getClipboard: getClipboard,
		pushClipboard: pushClipboard,
		clearClipboard: clearClipboard,
		loadJSONDocument: loadJSONDocument,
		saveJSONDocument: saveJSONDocument
	};
		
}();