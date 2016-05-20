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

var html = "text/html";
var encoding = "UTF-8";
var ClientSideResourceManager = Packages.com.google.refine.ClientSideResourceManager;
var RS = Packages.com.google.refine.RefineServlet;
var OR = Packages.com.google.refine.operations.OperationRegistry;
var RC = Packages.com.google.refine.model.recon.ReconConfig;

var logger = Packages.org.slf4j.LoggerFactory.getLogger("dbpedia-extension"),
    File = Packages.java.io.File,
    refineServlet = Packages.com.google.refine.RefineServlet;

/*
 * Function invoked to initialize the extension.
 */
function init() {

  logger.info("Initializing DBpedia extension...");

  RS.registerClassMapping(
  "com.google.refine.model.changes.DataExtensionChange",
  "com.zemanta.dbpedia.model.changes.DBpediaDataExtensionChange");
  
  RS.registerClassMapping(
		  "com.google.refine.model.changes.DataExtensionChange",
		  "com.zemanta.dbpedia.model.changes.ExtractEntitiesFromTextChange");
  
  //temp hack needed for the core module
  //to resolve this modul's classes
  RS.cacheClass(Packages.com.zemanta.dbpedia.model.changes.DBpediaDataExtensionChange);
  RS.cacheClass(Packages.com.zemanta.dbpedia.model.changes.ExtractEntitiesFromTextChange);


  RS.registerCommand(module, "extend-data", new Packages.com.zemanta.dbpedia.commands.DBpediaExtendDataCommand());
  RS.registerCommand(module, "preview-extend-data",   new Packages.com.zemanta.dbpedia.commands.DBpediaPreviewExtendDataCommand());

  RS.registerCommand(module, "extract-entities", new Packages.com.zemanta.dbpedia.commands.ExtractEntitiesFromTextCommand());
  RS.registerCommand(module, "preview-extract-entities", new Packages.com.zemanta.dbpedia.commands.ExtractEntitiesPreviewCommand());
  
  OR.registerOperation(module, "extend-data",Packages.com.zemanta.dbpedia.operations.DBpediaExtendDataOperation);
  OR.registerOperation(module, "extract-entities",Packages.com.zemanta.dbpedia.operations.ExtractEntitiesFromTextOperation);
  
  RC.registerReconConfig(module, "strict", Packages.com.zemanta.dbpedia.model.recon.DBpediaStrictReconConfig);
  RC.registerReconConfig(module, "extend", Packages.com.zemanta.dbpedia.model.recon.DBpediaDataExtensionReconConfig);
    // Script files to inject into /project page
  ClientSideResourceManager.addPaths(
    "project/scripts",
    module,
    [
      "scripts/extension.js",    
      "scripts/util/util.js",
      
      "scripts/dialogs/extend-data-preview-dialog.js",
      "scripts/dialogs/extract-entities-preview-dialog.js",
      "scripts/dialogs/zemanta-api-settings-dialog.js",
    ]
  );

  // Style files to inject into /project page
  ClientSideResourceManager.addPaths(
    "project/styles",
    module,
    [
      "styles/dialogs/extend-data-preview-dialog.less"
    ]
  );
}


function send(request, response, template, context) {
  butterfly.sendTextFromTemplate(request, response, context, template, encoding, html);
}
