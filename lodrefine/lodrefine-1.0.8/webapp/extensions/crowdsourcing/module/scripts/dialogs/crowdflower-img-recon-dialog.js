function ZemCFImgReconDialog(onDone) {
        this._onDone = onDone;
        this._extension = {};
        this._mappedFields = [];
        this._fields = [];
        var dismissBusy = DialogSystem.showBusy();

        this._dialog = $(DOM.loadHTML("crowdsourcing", "scripts/dialogs/crowdflower-img-recon-dialog.html"));
        this._elmts = DOM.bind(this._dialog);
        this._elmts.dialogHeader.text($.i18n._('crowd-ext-img')["header"]);
        this._elmts.uploadTab.text($.i18n._('crowd-ext-img')["upload-tab"]);
        this._elmts.selectJobLabel.text($.i18n._('crowd-ext-img')["select-job-label"]);
        this._elmts.imgUrlLabel.text($.i18n._('crowd-ext-img')["img-url"]);
        this._elmts.imgDescriptionLabel.text($.i18n._('crowd-ext-img')["img-desc"]);
        this._elmts.destUrlLabel.text($.i18n._('crowd-ext-img')["dest-url"]);
        this._elmts.optionsLabel.text($.i18n._('crowd-ext-img')["options"]);
        this._elmts.goldDataLabel.text($.i18n._('crowd-ext-img')["gold-data"]);
        this._elmts.uploadGoldLabel.text($.i18n._('crowd-ext-img')["upload-gold"]);
        this._elmts.selectGoldColLabel.text($.i18n._('crowd-ext-img')["select-gold-col"]);
        this._elmts.additionalInfoLabel.text($.i18n._('crowd-ext-img')["additional-info"]);
        this._elmts.selColsLabel.text($.i18n._('crowd-ext-img')["sel-cols"]);
        this._elmts.infoTemplateUpdate.html($.i18n._('crowd-ext-img')["info-update"]);
        this._elmts.okButton.text($.i18n._('crowd-ext-buttons')["ok"]);
        this._elmts.cancelButton.text($.i18n._('crowd-ext-buttons')["cancel"]);


        var self = this;

        this._elmts.jobTabs.tabs();
        self._renderAllExistingJobs();

        self._renderColumns();
        self._elmts.goldDataPanel.hide();

        this._elmts.okButton.click(function() {
                self._extension = {};
                self._extension.column_names = [];

                self._extension.job_id =  self._elmts.allJobsList.children(":selected").val();

                var tmp = {};
                tmp.name = $('option[name=img_url]:selected').val();
                tmp.safe_name = 'img_url';
                self._extension.column_names.push(tmp);

                tmp = {};
                tmp.name = $('option[name=img_desc]:selected').val();
                tmp.safe_name = 'img_desc';
                self._extension.column_names.push(tmp);
                
                tmp = {};
                tmp.name = $('option[name=dest_url]:selected').val();
                tmp.safe_name = 'dest_url';
                self._extension.column_names.push(tmp);
                
                if($('#upload-gold').is(':checked')) {
                        self._extension.golden_column = $('option[name=gold_data]:selected').val();
                } 

                $('#info-fields input:checked').each( function() {
                        var col = {};
                        col.name = $(this).attr('value');
                        col.safe_name = ZemantaCrowdSourcingExtension.util.convert2SafeName(col.name);
                        self._extension.column_names.push(col);
                });                
                DialogSystem.dismissUntil(self._level - 1);
                self._onDone(self._extension);
        });

        this._elmts.cancelButton.click(function() {	  
                DialogSystem.dismissUntil(self._level - 1);
        });

        this._elmts.uploadGoldBtn.change(function () {
                var checked = $('#upload-gold').is(':checked');

                if(checked) {
                    self._elmts.goldDataPanel.show();
                }
                else {
                    self._elmts.goldDataPanel.hide();
                }
            });

        dismissBusy();
        this._level = DialogSystem.showDialog(this._dialog);

};


ZemCFImgReconDialog.prototype._renderColumns = function() {

        var self = this;
        var columns = theProject.columnModel.columns;
        var columnListContainer = self._elmts.infoField;
        var tabindex =  $( "#jobTabs" ).tabs( "option", "active" );

        var imgUrl = self._elmts.imgUrlColumn;
        var imgDesc = self._elmts.imgDescColumn;
        var destUrl = self._elmts.destUrlColumn;
        var gold = self._elmts.goldDataColumn;

        $.each(columns, function(index, value){         
            imgUrl.append($('<option value="' + value.name + '" name="img_url">'+ value.name + '</option>'));
            imgDesc.append($('<option value="' + value.name + '" name="img_desc">'+ value.name + '</option>'));
            destUrl.append($('<option value="' + value.name + '" name="dest_url">'+ value.name + '</option>'));
            gold.append($('<option value="' + value.name + '" name="gold_data">'+ value.name + '</option>'));
        });

        ZemUtil.renderColumns(columns, columnListContainer, tabindex);

    };



ZemCFImgReconDialog.prototype._renderAllExistingJobs = function() {

        var self = this;
        var selContainer = self._elmts.allJobsList;
        var elemStatus = self._elmts.statusMessage;

        $('<option name="opt_none" value="none">' +$.i18n._('crowd-ext-img')["select-job"] +'</option>').appendTo(selContainer);

        ZemantaCrowdSourcingExtension.util.loadAllExistingJobs(function(data, status, message) {
                if(status != "ERROR") {
                        elemStatus.removeClass('text-error');
                        elemStatus.addClass('text-success');
                        elemStatus.html("Jobs are loaded.");
                } else {
                        elemStatus.addClass('text-error');
                        elemStatus.removeClass('text-success');
                        elemStatus.html($.i18n._('crowd-ext-img')["error"] + message);
                }

                $.each(data, function(index, value) {

                        var title = (value.title == null)? $.i18n._('crowd-ext-img')["title-undefined"] : value.title;
                        var job = $('<option name="opt_' + index + '" value=' + value.id + '>' + title + $.i18n._('crowd-ext-img')["job-id"] + value.id + '</option>');
                        selContainer.append(job);
                });

                selContainer.change(function() {
                        this._extension = {};
                        this._extension.job_id = $(this).children(":selected").val();
                        this._selectedJob = this._extension.job_id;

                });
        });
};
