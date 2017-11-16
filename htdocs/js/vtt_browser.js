/* global $ */

(function vttBrowser(){

    var audioFilesFolder = "AUDIO_FILES";
    var BROWSE_CLASS = "browse";
    var PREVIEW_CLASS = "preview";
    var AUDIO_PLAYER_CLASS = 'audio-player';
    var FILE_INPUT_CLASS = 'multiple-file-input';
    var SELECT_CLASS = 'audio-selection';
    var WARNINGS_CONTAINER_CLASS = 'warnings-container';
    var WARNINGS_CLASS = 'warnings';
    var TRANSCRIPT_CONTAINER_CLASS = "transcript-container";
    var TRANSCRIPT_CLASS = 'transcript';
    var AUDIO_INFO_CLASS = "audio-info";
    var INSTRUCTIONS_CLASS = "instructions";
    var AUDIO_FOLDER_CLASS = "audio-folder";
    var BACK_TO_FILES_CLASS = "file-choice";

    var BACK_CLASS = "back";
    var NEXT_CLASS = "next";
    var BACK_OR_NEXT_SELECTOR = ["."+BACK_CLASS,"."+NEXT_CLASS].join(",");

    var basenames;

    var AUDIO_MIMETYPE = "audio/mp3";

    var AUDIO_FILE_EXT = ".MP3";
    var TRANSCRIPT_FILE_EXT = ".VTT";

    var AUDIO_REGEXP = new RegExp(AUDIO_FILE_EXT,'i');
    var TRANSCRIPT_REGEXP = new RegExp(TRANSCRIPT_FILE_EXT,'i');
    
    var instructions = [
        '<p>Please select some audio ('+AUDIO_FILE_EXT+') and transcript ('+TRANSCRIPT_FILE_EXT+') files.</p>',
        '<p>The filenames of each audio and transcript file should be identical.</p>',
        '<p>Browse to this folder (within htdocs):</p>'        
    ].join("");

    function showInstructions(){
        
        $("."+AUDIO_FOLDER_CLASS).val(audioFilesFolder);
        $("."+INSTRUCTIONS_CLASS).html(instructions);

        $("."+BROWSE_CLASS).show();
        $("."+PREVIEW_CLASS).hide();
    }

    function hideInstructions(){
        $("."+BROWSE_CLASS).hide();
        $("."+PREVIEW_CLASS).show();
    }

    function resetFiles(){
        basenames = {};
    }

    function info(infoText){
        $("."+AUDIO_INFO_CLASS).show();
        $("."+AUDIO_INFO_CLASS).html(infoText);
    }

    function clearInfo(){
        $("."+AUDIO_INFO_CLASS).hide();
        info("");
    }

    function clearWarnings(){
        $("."+WARNINGS_CONTAINER_CLASS).hide();
        $("."+WARNINGS_CLASS).empty();
    }

    function warn(warning){
        $("."+WARNINGS_CONTAINER_CLASS).show();
        $("."+WARNINGS_CLASS).append('<p>'+warning+'</p>');
    }

    function createBase(basename){
        if (!basenames[basename]){
            basenames[basename] = [];
        }        
    }

    function hasFileType(basename,fileExtension){
        var filesArray = basenames[basename] || [];
        return $.inArray(fileExtension,filesArray) >= 0;
    }

    function hasAudio(basename){
        return hasFileType(basename,AUDIO_FILE_EXT);
    }

    function hasTranscript(basename){
        return hasFileType(basename,TRANSCRIPT_FILE_EXT);
    }

    function checkFiles(filenames){
        
        // check there is an MP3 and VTT for each

        $.each(filenames,function(i,filename){
            
            var basename;

            if (filename.match(AUDIO_REGEXP)){
                
                basename = filename.replace(AUDIO_REGEXP,"");
                createBase(basename);
                basenames[basename].push(AUDIO_FILE_EXT);
                return true;
            }

            if (filename.match(TRANSCRIPT_REGEXP)){
                
                basename = filename.replace(TRANSCRIPT_REGEXP,"");
                createBase(basename);
                
                basenames[basename].push(TRANSCRIPT_FILE_EXT);
                return true;
            }

            warn("Ignoring file '"+filename+"'");

        });

        $.each(basenames,function(basename){

            if (!hasTranscript(basename)){
                warn(basename + " is missing its VTT file");
            }

            if (!hasAudio(basename)){
                warn(basename + " is missing its MP3 file");
            }

        });

    }

    function createOptions(){

        var select = $("."+SELECT_CLASS);
        var optionHtml = [];

        select.empty();

        $.each(basenames,function(basename){ //,filesArray

            optionHtml.push(
                '<option value="',basename,'">',
                    basename,
                '</option>'
            );

        });

        select.append(optionHtml.join(""));

    }

    function clearAudioPlayer(){
        $("."+AUDIO_PLAYER_CLASS).html("");
    }

    function getCurrentBasename(){
        return $("."+SELECT_CLASS).find("option:selected").val() || null;
    }
    
    function resetTranscript(){

        $("."+TRANSCRIPT_CLASS).html();
        $("."+TRANSCRIPT_CONTAINER_CLASS).hide();
    }

    function writeTranscript(text){
        var lineHeight = 20;
        var numLines = text.split("\n").length;
        var textareaHeight = numLines * lineHeight;

        $("."+TRANSCRIPT_CLASS)
            .html(text)
            .css({height:textareaHeight});

        $("."+TRANSCRIPT_CONTAINER_CLASS).show();          
    }

    function loadTranscript(){

        resetTranscript();

        var basename = getCurrentBasename();
        var filename = audioFilesFolder + "/" + basename + TRANSCRIPT_FILE_EXT;

        $.ajax({
            url : filename,
            dataType: "text",
            success : function (data) {
                
                writeTranscript(data);
            }
        });

    }

    function createAudioTag(){
        
        clearAudioPlayer();
        
        var basename = getCurrentBasename();

        if (!basename){
            console.log("No audio basename - cannot show audio");
            return;
        }
        
        if (!hasAudio(basename)){
            info("This file has no audio");
        }

        if (!hasTranscript(basename)){
            info("This file has no transcript");
        }

        var audioHtml = [
            '<video controls>',
                '<source type="',AUDIO_MIMETYPE,'" src="',audioFilesFolder,"/",basename,AUDIO_FILE_EXT,'">',
                '<track label="English" kind="subtitles" srclang="en" src="',audioFilesFolder,"/",basename,TRANSCRIPT_FILE_EXT,'" default>',
            '</video>'
        ];     

        console.info(audioHtml);

        $("."+AUDIO_PLAYER_CLASS).html(audioHtml.join(""));
    }

    function updatePreview(){
        clearInfo();
        createAudioTag();
        loadTranscript();
    }

    function updateFiles() {

        var files = $("."+FILE_INPUT_CLASS).prop("files");
        var filenames = $.map(files, function(val) { return val.name; });

        if (files.length === 0){
            showInstructions();
            alert("Please choose at least one file");
            return;
        }

        hideInstructions();
        resetFiles();
        resetTranscript();
        clearInfo();
        clearWarnings();
        checkFiles(filenames);
        createOptions(filenames);
        
        // auto load first item
        updatePreview();

    }
    
    function goto(relativeOption){

        var jQueryBackDOM = "prev";
        var jQueryNextDOM = "next";
        // these are jQuery functions for navigating the DOM
        var directionFunction = relativeOption === 1 ? jQueryNextDOM : 
                                relativeOption === -1 ? jQueryBackDOM : false;

        if (!directionFunction){
            console.error("Goto requires 1 or -1");
            return;
        }

        var currentlySelected= $("."+SELECT_CLASS).find("option:selected");
        var targetItem = currentlySelected[directionFunction]('option');

        if (!targetItem.length){
            info("No more files");
            return;
        }

        currentlySelected.removeProp('selected');
        targetItem.prop('selected', 'selected');

        updatePreview();
    }

    function backOrNext(){
        var isBack = $(this).hasClass(BACK_CLASS);
        var isNext = $(this).hasClass(NEXT_CLASS);

        if (isBack){
            goto(-1);
            return;
        }
        
        if (isNext){
            goto(1);
            return;
        }
        
        console.error("Weird button",this);
    }

    function updateFolder(){
        audioFilesFolder = $("."+AUDIO_FOLDER_CLASS).val();
    }

    function enableEvents(){
        $("."+FILE_INPUT_CLASS).on('change', updateFiles);
        $(BACK_OR_NEXT_SELECTOR).on('click', backOrNext);
        $("."+SELECT_CLASS).on('change', updatePreview);
        $("."+AUDIO_FOLDER_CLASS).on('change',updateFolder);
        $("."+BACK_TO_FILES_CLASS).on('click',showInstructions);
    }
    
    function init(){
        resetFiles();
        showInstructions();
        enableEvents();
    }

    init();

}());