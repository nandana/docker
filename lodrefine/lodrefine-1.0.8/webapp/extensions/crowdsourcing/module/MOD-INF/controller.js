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

var logger = Packages.org.slf4j.LoggerFactory.getLogger("crowdsourcing"),
    File = Packages.java.io.File,
    refineServlet = Packages.com.google.refine.RefineServlet;

/*
 * Function invoked to initialize the extension.
 */
function init() {
  logger.info("Initializing crowdsourcing extension...");

  RS.registerCommand(module, "create-crowdflower-job", new Packages.com.zemanta.crowdsourcing.crowdflower.commands.CreateNewJobCommand());
  RS.registerCommand(module, "preview-crowdflower-jobs", new Packages.com.zemanta.crowdsourcing.crowdflower.commands.PreviewExistingJobsCommand());
  RS.registerCommand(module, "copy-crowdflower-job", new Packages.com.zemanta.crowdsourcing.crowdflower.commands.CopyJobCommand());
  RS.registerCommand(module, "get-crowdflower-job", new Packages.com.zemanta.crowdsourcing.crowdflower.commands.GetJobInfoCommand());
  RS.registerCommand(module, "evaluate-recon-job", new Packages.com.zemanta.crowdsourcing.crowdflower.commands.EvaluateReconJobCommand());
  RS.registerCommand(module, "image-recon-job", new Packages.com.zemanta.crowdsourcing.crowdflower.commands.ImageReconJobCommand());

  // Script files to inject into /project page
  ClientSideResourceManager.addPaths(
    "project/scripts",
    module,
    [
      "scripts/extension.js",
      "scripts/util.js",
      "scripts/dialogs/crowdflower-api-settings-dialog.js",
      "scripts/dialogs/crowdflower-job-columns-dialog.js",
      "scripts/dialogs/crowdflower-eval-recon-dialog.js",
      "scripts/dialogs/crowdflower-img-recon-dialog.js",
    ]
  );

  // Style files to inject into /project page
  ClientSideResourceManager.addPaths(
    "project/styles",
    module,
    [
      "styles/theme.less",
      "styles/dialogs/crowdflower-gui.less",
    ]
  );
}

function send(request, response, template, context) {
  butterfly.sendTextFromTemplate(request, response, context, template, encoding, html);
}
