
function ZemantaCrowdFlowerDialog(onDone) {
        this._onDone = onDone;
        this._extension = {};
        this._mappedFields = [];
        this._fields = [];
        this._cml = "";
        var dismissBusy = DialogSystem.showBusy();

        this._dialog = $(DOM.loadHTML("crowdsourcing", "scripts/dialogs/crowdflower-job-columns-dialog.html"));
        this._elmts = DOM.bind(this._dialog);
        this._elmts.dialogHeader.text("Upload data to CrowdFlower");

        this._renderAllExistingJobs();
        this._renderAllColumns2(this._elmts.columnsMenu_0, this._elmts.columnList_0, 0);

        var self = this;

        this._elmts.dataPanel.hide();
        this._elmts.columnsPanel.hide();

        this._elmts.extFieldsPanel.hide();
        this._elmts.extColumnsPanel.hide();
        this._elmts.jobTemplatePanel.hide();
        
        this._elmts.jobTabs.tabs();


        this._elmts.createFromTemplate.click(function () {

                $('#autocomplete').autocomplete({
                        source: ["NHL player", "player", "movie", "show", "person", "product", "movie", "TV series"]
                });

                self._elmts.dataUpload.hide();
                self._elmts.columnsPanel.hide();
                self._elmts.jobTemplatePanel.show();

        });
        
        this._elmts.createFromBlank.click(function () {

                self._elmts.jobTemplatePanel.hide();
                self._elmts.jobTitle.val("");
                self._elmts.jobInstructions.val("");
                self._elmts.dataUpload.show();

                if(self._elmts.chkUploadToNewJob.is(':checked')) {
                        self._elmts.columnsPanel.show();
                }
                self._elmts.newJobDetailsPanel.show();
                self._cml = "";
        });

        this._elmts.buttonPreviewTemplate.click(function () {
                var content = $('<p>' + self._elmts.jobInstructions.val() + '</p>');
                var dlg = $('<div>').append(content);
                dlg.dialog({
                        resizable: false,
                        height:450,
                        appendTo: $('#refine-dialog'),
                        modal: true,
                        buttons: {
                                "OK": function() {
                                        $( this ).dialog( "close" );
                                }
                        }
                });
        });


        this._elmts.chkUploadToNewJob.click(function () {

                if(self._elmts.chkUploadToNewJob.is(':checked')) {
                        self._elmts.columnsPanel.show();
                }
                else {
                        self._elmts.columnsPanel.hide();
                }

        });

        this._elmts.buttonLoadTemplate.click(function () {
                self._updateFieldsFromTemplate(self._elmts.entityType.val());
        });


        this._elmts.okButton.click(function() {
                self._extension = {};
                self._extension.title= self._elmts.jobTitle.val();
                self._extension.instructions = self._elmts.jobInstructions.val();
                self._extension.content_type = "json";
                self._extension.column_names = [];

                var uploadData = false;
                //for newer versions of jquery ui
                //var tabindex = $( "#jobTabs" ).tabs( "option", "active" );
                var tabindex = $("#jobTabs").tabs('option', 'selected');
                if(tabindex === 0) {
                        self._extension.new_job = true;  

                        if(self._elmts.chkUploadToNewJob.is(':checked')) {
                                uploadData = true;
                        }

                        $('#project-columns-' + tabindex +' input.zem-col:checked').each( function() {
                                var col = {};
                                col.name = $(this).attr('value');
                                col.safe_name = ZemantaCrowdSourcingExtension.util.convert2SafeName(col.name);
                                self._extension.column_names.push(col);
                        });

                        self._extension.cml = self._cml;

                } else {
                        self._extension.new_job = false;
                        self._extension.job_id =  self._elmts.allJobsList.children(":selected").val();

                        if(self._mappedFields.length > 0) {
                                $.each(self._mappedFields, function(index, value) {
                                        var col = {};
                                        col.name = value.column;
                                        col.safe_name = value.field;
                                        self._extension.column_names.push(col);
                                });
                        } else {
                                $('#project-columns-' + tabindex +' input.zem-col:checked').each( function() {
                                        var col = {};
                                        col.name = $(this).attr('value');
                                        col.safe_name = ZemantaCrowdSourcingExtension.util.convert2SafeName(col.name);
                                        self._extension.column_names.push(col);
                                });
                        }		  

                        if(self._extension.column_names.length > 0) {
                                uploadData = true;
                        }
                }

                if(uploadData){	  	  
                        self._extension.upload = true;
                } else {
                        console.log("No data will be uploaded...");
                        self._extension.upload = false;
                }

                DialogSystem.dismissUntil(self._level - 1);
                self._onDone(self._extension);

        });


        this._elmts.cancelButton.click(function() {	  
                DialogSystem.dismissUntil(self._level - 1);
        });


        this._elmts.jobTitle.blur(function () {
                var title = self._elmts.jobTitle.val();
                if(title.length > 5 && title.length < 255  ) {
                        $('#title-warning').hide();
                } else {
                        $('#title-warning').show();
                }
        });

        this._elmts.jobInstructions.blur(function () {
                var instructions = self._elmts.jobInstructions.val();	  
                if(instructions ===""  ) {
                        $('#instructions-warning').show();
                } else {
                        $('#instructions-warning').hide();
                }
        });

        this._elmts.copyJobButton.click(function() {
                var job_id = self._elmts.allJobsList.val();

                if(job_id === "none") {
                        alert("First select job to copy!");
                }
                else {
                        self._copyAndUpdateJob(job_id);
                }

        });

        dismissBusy();
        this._level = DialogSystem.showDialog(this._dialog);

};

ZemantaCrowdFlowerDialog.prototype._copyAndUpdateJob = function(jobid) {

        var self = this;
        self._extension = {};
        self._extension.job_id = jobid;

        //add gold or all units
        var option = $('input[name=units]:checked').val();

        if(option == "all_units") {
                self._extension.all_units = true;
        } else if(option == "gold") {
                self._extension.gold = true;
        }

        ZemantaCrowdSourcingExtension.util.copyJob(self._extension, function(data){
                
                var msg = "";
                
                if(data[status].toLowerCase() == "error") {
                        msg = "There was an error either during copying or updating list.";
                        ZemUtil.showErrorDialog(msg);
                        //add class to status-message
                        self._elmts.statusMessage.removeClass('text-success');
                        self._elmts.statusMessage.addClass('text-error');
                        self._elmts.statusMessage.html(msg);
                } else {
                        msg = "Job was successfully copied.";
                        self._elmts.statusMessage.removeClass('text-error');
                        self._elmts.statusMessage.addClass('text-success');
                        self._elmts.statusMessage.html(msg);
                        //TODO: update this!
                        ZemUtil.showConfirmation("Copying job",msg);
                 }
                self._updateJobList(data);
        });

};


ZemantaCrowdFlowerDialog.prototype._updateJobList = function(data) {

        var self = this;
        var selContainer = self._elmts.allJobsList;
        var selected = "";
        var status = data["status"].toLowerCase();
        var dismissBusy = DialogSystem.showBusy();

        selContainer.empty();

        $('<option name="opt_none" value="none">--- select a job --- </option>').appendTo(selContainer);


        if(status.toLowerCase() === "error") {
                self._elmts.statusMessage.removeClass('text-success');
                self._elmts.statusMessage.addClass('text-error');
                self._elmts.statusMessage.html("There was an error: <br/>" + data["message"]);
                return;
        }
        else {

                self._elmts.statusMessage.removeClass('text-error');
                self._elmts.statusMessage.addClass('text-success');
                self._elmts.statusMessage.html("Job list was updated.");

                if(data["jobs"] && data["jobs"]!= null) {
                        var jobs = data["jobs"];

                        for (var index = 0; index < jobs.length; index++) {
                                var value = jobs[index];

                                if(value.id === data.job_id) {
                                        selected = " selected";
                                } else {
                                        selected = "";
                                }

                                var job = $('<option name="opt_' + index + '" value=' + value.id + '' + selected + '>' + value.title + ' (job id: ' + value.id + ')</option>');		
                                selContainer.append(job);

                        }
                }
        }


        dismissBusy();
};

ZemantaCrowdFlowerDialog.prototype._renderAllExistingJobs = function() {

        var self = this;
        var selContainer = self._elmts.allJobsList;
        var elemStatus = self._elmts.statusMessage;

        $('<option name="opt_none" value="none">--- select a job --- </option>').appendTo(selContainer);

        ZemantaCrowdSourcingExtension.util.loadAllExistingJobs(function(data, status, message) {

                if(status == "ok" | status == 200) {
                        elemStatus.removeClass('text-error');
                        elemStatus.addClass('text-success');
                        elemStatus.html("Jobs are loaded.");
                } else {
                        var msg = "There was an error loading jobs.\n" + message;
                        elemStatus.removeClass('text-success');
                        elemStatus.addClass('text-error');
                        elemStatus.html(msg);
                        return;
                }

                $.each(data, function(index, value) {

                        var title = (value.title == null)? "Title not defined" : value.title;
                        var job = $('<option name="opt_' + index + '" value=' + value.id + '>' + title + ' (job id: ' + value.id + ')</option>');
                        selContainer.append(job);
                });

                selContainer.change(function() {
                        this._extension = {};
                        this._extension.job_id = $(this).children(":selected").val();
                        this._selectedJob = this._extension.job_id;

                        ZemantaCrowdSourcingExtension.util.getJobInfo(this._extension, function(data){
                                self._updateJobInfo(data);
                        });
                });
        });
};

ZemantaCrowdFlowerDialog.prototype._updateJobInfo = function(data) {

        var self = this;
        var elm_jobTitle = self._elmts.extJobTitle;
        var elm_jobInstructions = self._elmts.extJobInstructions;

        //reset fields and mappings
        self._fields = [];
        self._mappedFields = [];

        var status = data["status"];

        if(status.toLowerCase() === "error") {
                ZemUtil.showErrorDialog(status + ': ' + data.message, '.dialog-frame');
                self._elmts.statusMessage.removeClass('text-success');
                self._elmts.statusMessage.addClass('text-error');
                self._elmts.statusMessage.html(status + ': ' + data.message);
                return;
        } else {

                self._elmts.statusMessage.removeClass('text-error');
                self._elmts.statusMessage.addClass('text-success');
                self._elmts.statusMessage.html('Job info updated.' );


                if(data["title"] === null || data["title"] === "" ) {
                        elm_jobTitle.val("(title undefined)");
                } else {
                        elm_jobTitle.val(data["title"]);
                }

                if(data["instructions"] === null || data["instructions"] === "") {
                        elm_jobInstructions.html("(instructions undefined)");
                }
                else {
                        elm_jobInstructions.html(data["instructions"]);
                }

                self._elmts.extUnitsCount.html(data["units_count"]);

                self._elmts.dataPanel.show();


                if(data["fields"]!= null && data["fields"].length > 0) {
                        self._elmts.extColumnsPanel.hide();
                        self._elmts.extFieldsPanel.show();
                        self._fields = data["fields"];
                        self._renderMappings();
                } else {			
                        self._elmts.extFieldsPanel.hide();
                        self._renderAllColumns2(self._elmts.columnsMenu_1, self._elmts.columnList_1, 1);
                        this._elmts.extColumnsPanel.show();
                }
        }
};

ZemantaCrowdFlowerDialog.prototype._renderAllColumns2 = function(columnContainer, columnListContainer, tabindex) {

        var columns = theProject.columnModel.columns;

        var linkSelectAll = $('<a href="#" id="select-all-columns-' + tabindex +'"> Select all </a>');
        columnContainer.append(linkSelectAll);
        var linkClearAll = $('<a href="#" id="clear-all-columns-' + tabindex + '"> Clear all </a>');
        columnContainer.append(linkClearAll);

        ZemUtil.renderColumns(columns, columnListContainer, tabindex);

        linkClearAll.click(function () {
                $('#project-columns-' + tabindex + ' input.zem-col').each(function () {
                        $(this).attr('checked', false);
                });
        });

        linkSelectAll.click(function() {
                $('#project-columns-'+ tabindex + ' input.zem-col').each(function () {
                        $(this).attr('checked', true);
                });
        });
};


ZemantaCrowdFlowerDialog.prototype._showColumnsDialog = function(field, mapped_col) {
        var self = this;

        var frame = DialogSystem.createDialog();
        frame.width("500px");

        $('<div></div>').addClass("dialog-header").text("Add mapping for field: " + field).appendTo(frame);
        var body = $('<div></div>').addClass("dialog-body").appendTo(frame);
        var footer = $('<div></div>').addClass("dialog-footer").appendTo(frame);

        var columns = theProject.columnModel.columns;

        body.html(
                        '<div class="grid-layout layout-normal layout-full">' +
                        '<div id="columns" bind="projColumns" class="project-columns"></div>' +
                        '</div>'
        );

        var bodyElmts = DOM.bind(body);

        $.each(columns, function(index, value){

                var input = $('<input type="radio" name="columns" class="zem-col" value="' + value.name + '">' + value.name + '</input><br/>').appendTo(bodyElmts.projColumns);					
                if(value.name === mapped_col) {
                        input.attr("checked","true");
                }
        });

        footer.html(
                        '<button class="btn" bind="okButton">&nbsp;&nbsp;OK&nbsp;&nbsp;</button>' +
                        '<button class="btn" bind="cancelButton">Cancel</button>'
        );
        var footerElmts = DOM.bind(footer);

        var level = DialogSystem.showDialog(frame);

        var dismiss = function() {
                DialogSystem.dismissUntil(level - 1);
        };

        footerElmts.cancelButton.click(dismiss);

        footerElmts.okButton.click(function() {
                var new_mapped = $('input[name=columns]:checked').val();
                self._addFCMapping(field, mapped_col, new_mapped);		  
                dismiss();
                self._renderMappings();
        });
};

ZemantaCrowdFlowerDialog.prototype._renderMappings = function() {
        var self = this;
        var elm_fields = self._elmts.extJobFields;
        elm_fields.empty();

        $.each(self._fields, function(index, value) {
                var link = $('<a title="' + value + '" href="javascript:{}">' + value + '</a>').appendTo(elm_fields);
                $('<span>&nbsp;&nbsp;&gt;&gt;&nbsp;&nbsp;</span>').appendTo(elm_fields);
                var mapped_column = self._getMappedColumn(value);
                var col_name = ((mapped_column === "") ? "(click to add column mapping)": mapped_column);

                var link2 = $('<a href="javascript:{}" data-value="' + value + '">' + col_name + '</a><br/>').appendTo(elm_fields);

                link.click (function(){
                        var field = $(this).text();
                        self._showColumnsDialog($(this).text(),self._getMappedColumn(field));
                });	

                link2.click(function() {
                        var field = $(this).data("value");
                        self._showColumnsDialog(field,self._getMappedColumn(field));
                });

        });	

};

ZemantaCrowdFlowerDialog.prototype._addFCMapping = function(field, old_column, new_column) {
        var self = this;
        if(old_column === "") {
                var fc = {};
                fc.field = field;
                fc.column = new_column;
                self._mappedFields.push(fc);
        } else {
                $.each(self._mappedFields, function(index, value) {
                        if(value.field === field) {
                                value.column = new_column;
                                return;
                        }
                });
        }
};

ZemantaCrowdFlowerDialog.prototype._getMappedColumn = function (field) {

        var self = this;
        var column = "";
        $.each(self._mappedFields, function(index, value) {
                if(value.field === field) {
                        column = value.column;
                }
        });

        return column;
};

ZemantaCrowdFlowerDialog.prototype._fillReconEvalTemplate = function (entityType, recon, reconSearchUrl) {

        var self = this;

        var title = "Find " + recon + " profile page for " + entityType;
        var instructions = ZemUtil.loadText("crowdsourcing", "scripts/templates/recon-eval/instructions.html");
        var cml = ZemUtil.loadText("crowdsourcing", "scripts/templates/recon-eval/cml.html");

        function capitaliseFirstLetter(string)
        {
                return string.charAt(0).toUpperCase() + string.slice(1);
        }
        
        function replaceAll (find, replace, string) {
                return string.replace(new RegExp(find, 'g'), replace);
        };

        instructions = replaceAll("\\[\\[ENTITY\\]\\]",entityType, instructions);
        instructions = replaceAll("\\[\\[SERVICE_NAME\\]\\]", recon, instructions);
        instructions = replaceAll("\\[\\[SERVICE_URL\\]\\]", reconSearchUrl, instructions);
        cml = replaceAll("\\[\\[ENTITY\\]\\]",entityType, cml);
        cml = replaceAll("\\[\\[SERVICE_NAME\\]\\]", recon, cml);
        cml = replaceAll("\\[\\[SERVICE_URL\\]\\]", reconSearchUrl, cml);
        
        self._elmts.jobTitle.val(title);
        self._elmts.jobInstructions.val(instructions);
        self._cml = cml;        
};


//TODO: add default size if none present
//TODO: what about scenario A, B and C (not all questions are generated) -> set attributes?
ZemantaCrowdFlowerDialog.prototype._fillImageReconTemplate = function () {
        var self = this;
        
        var title = "Find best matching Wikipedia page for image";
        
        var instructions = ZemUtil.loadText("crowdsourcing", "scripts/templates/image-recon/instructions.html");
        var cml = ZemUtil.loadText("crowdsourcing", "scripts/templates/image-recon/cml.html");
        
        self._elmts.jobTitle.val(title);        
        self._elmts.jobInstructions.val(instructions);
        self._cml = cml;
        
};

ZemantaCrowdFlowerDialog.prototype._updateFieldsFromTemplate = function (param) {

        var self = this;
        var recon = "";
        var reconSearchUrl = "";

        var template = self._elmts.jobTemplates.children(":selected").val();

        if(template === "blank") {
                ZemUtil.showErrorDialog("Choose template first.", '.dialog-frame');
                return;
        }
        
        if(template === "freebase") {
                recon = "Freebase";
                reconSearchUrl = "http://www.freebase.com/";
                self._fillReconEvalTemplate(param, recon, reconSearchUrl);

        }
        else if(template === "dbpedia") {
                recon = "DBpedia";
                reconSearchUrl = "http://dbpedia.org/fct/";
                self._fillReconEvalTemplate(param, recon, reconSearchUrl);
        }
        else if(template === "img_recon") {
                self._fillImageReconTemplate();
        }
};
