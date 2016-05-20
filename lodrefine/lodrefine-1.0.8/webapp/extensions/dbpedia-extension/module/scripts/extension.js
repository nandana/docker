/*

Copyright 2010, Google Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

    * Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
    * Neither the name of Google Inc. nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,           
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY           
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

var ZemantaDBpediaExtension = {handlers: {}, util: {}};

// Internationalization init
var lang = navigator.language.split("-")[0]
		|| navigator.userLanguage.split("-")[0];
var dictionary = "";
$.ajax({
	url : "/command/core/load-language?",
	type : "POST",
	async : false,
	data : {
	  module : "dbpedia-extension",
//		lang : lang
	},
	success : function(data) {
		dictionary = data;
	}
});
$.i18n.setDictionary(dictionary);
// End internationalization

ZemantaDBpediaExtension.handlers.doNothing = function() {
	alert("Zemanta extension active...");
};

ZemantaDBpediaExtension.handlers.storeAllSettings = function() {
	
	new ZemantaDBpediaSettingsDialog(function(newApiKey, dbpediaTimeout, zemantaTimeout) 
			{
			ZemantaDBpediaExtension.util.saveSetting("zemanta.apikey", newApiKey);
			ZemantaDBpediaExtension.util.saveSetting("dbpediaService.timeout", dbpediaTimeout);
			ZemantaDBpediaExtension.util.saveSetting("zemantaService.timeout", zemantaTimeout);
			}
	);
};


ZemantaDBpediaExtension.util.getReconId = function(column, visibleRows) {
	var rows = theProject.rowModel.rows;
    var row = null;
    var cell = null;
    var reconFound = false;
    var reconId = null;
    var o = visibleRows;
  
    //check if any of visible cells contain reconciliation information
    for (var i = 0; (i < o.rowIndices.length) && !reconFound; i++) {
    	row = rows[o.rowIndices[i]];
    	cell = row.cells[column.cellIndex];
    	if(cell!=null && cell.r != null){   
	    	if(cell.r && (typeof(cell.r.m) !== 'undefined') ) {
	    		reconId = cell.r.m.id;
	    		reconFound = true;
	    	}
    	}
    }    
    return reconId;
};

ZemantaDBpediaExtension.util.getCellText = function(column, visibleRows) {
	var rows = theProject.rowModel.rows;
    var row = null;
    var cell = null;
    var o = visibleRows;
    var textFound = false;
    var cellText = "";
  
    //check if any of visible cells contain full text, return first one found
    for (var i = 0; (i < o.rowIndices.length) && !textFound; i++) {
    	row = rows[o.rowIndices[i]];
    	cell = row.cells[column.cellIndex];
    	if(cell!=null){   
	    	if(cell.v) {
	    		cellText = cell.v;
	    		textFound = true;
	    	}
    	}
    }    
    return cellText;
};



ExtensionBar.addExtensionMenu({
"id": "dbpedia-ext",
"label": "DBpedia",
"submenu": [
	 {
		 "id":"dbpedia-ext/settings",
		        	 label: $.i18n._('zem-ext-menu')["api-set"],
		        	 click: ZemantaDBpediaExtension.handlers.storeAllSettings
	}
	]
 });

  
  // faster way to get properties - not using column.reconConfig  
  // Zemanta recon api doesn't return types anyway  
  // check sampled visible rows for reconciliation match id
  // pass first found if as a type in the dialog

 DataTableColumnHeaderUI.extendMenu(function(column, columnHeaderUI, menu) {
  var columnIndex = Refine.columnNameToColumnIndex(column.name);
  var doAddColumnFromDBpedia = function() {
  var o = DataTableView.sampleVisibleRows(column);
  var reconId = ZemantaDBpediaExtension.util.getReconId(column, o);
  var isDBpedia = false;

  if(reconId !== null) {
	  isDBpedia = (reconId.indexOf("dbpedia.org") != -1);
  }
  
  if(reconId === null || !isDBpedia) {
	  alert($.i18n._('zem-ext-menu')["alert-recon"]);
	  return;
  }


  new ZemantaExtendDataPreviewDialog(
      column, 
      columnIndex, 
      reconId,
      o.rowIndices, 
      function(extension) {
        Refine.postProcess(
            "dbpedia-extension",
            "extend-data", 
            {
              baseColumnName: column.name,
              columnInsertIndex: columnIndex + 1
            },
            {
              extension: JSON.stringify(extension)
            },
            { rowsChanged: true, modelsChanged: true }
        );
      }
    );
  };

  MenuSystem.insertAfter(
    menu,
    [ "core/edit-column", "core/add-column-by-fetching-urls" ],
    {
      id: "dbpedia-ext/add-columns-from-dbpedia",
      label: $.i18n._('zem-ext-menu')["add-col"] + "...",
      click: doAddColumnFromDBpedia
    }
  );
});
 
DataTableColumnHeaderUI.extendMenu(function(column, columnHeaderUI, menu) {
	  var columnIndex = Refine.columnNameToColumnIndex(column.name);
	  
	  var doExtractEntitiesFromText = function() {
		  var o = DataTableView.sampleVisibleRows(column);
		  var cellText = ZemantaDBpediaExtension.util.getCellText(column, o);
		  
		  new ZemantaExtractEntitiesPreviewDialog(
		      column, 
		      columnIndex,
		      cellText,
		      o.rowIndices, 
		      function(extension) {
		        Refine.postProcess(
		            "dbpedia-extension",
		            "extract-entities", 
		            {
		              baseColumnName: column.name,
		              columnInsertIndex: columnIndex + 1
		            },
		            {
		              extension: JSON.stringify(extension)
		            },
		            { rowsChanged: true, modelsChanged: true }
		        );
		      }
		    );
	  };

	  MenuSystem.insertAfter(
	    menu,
	    [ "core/edit-column", "dbpedia-ext/add-columns-from-dbpedia" ],
	    {
	      id: "dbpedia-ext/extract-entities-from-text",
	      label: $.i18n._('zem-ext-menu')["extract-ent"],
	      click: doExtractEntitiesFromText
	    }
	  );
	    
	});
