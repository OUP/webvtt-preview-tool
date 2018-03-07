/* global $ */

(function vttBrowser(){

    var mediaFilesFolder = "AUDIO_AND_VIDEO_FILES";
    var BROWSE_CLASS = "browse";
    var PREVIEW_CLASS = "preview";
    var PLAYER_CLASS = 'media-player';
    var FILE_INPUT_CLASS = 'multiple-file-input';
    var SELECT_CLASS = 'audio-selection';
    var WARNINGS_CONTAINER_CLASS = 'warnings-container';
    var WARNINGS_CLASS = 'warnings';
    var TRANSCRIPT_CONTAINER_CLASS = "transcript-container";
    var TRANSCRIPT_CLASS = 'transcript';
    var AUDIO_INFO_CLASS = "media-info";
    var INSTRUCTIONS_CLASS = "instructions";
    var MEDIA_FOLDER_CLASS = "media-folder";
    var BACK_TO_FILES_CLASS = "file-choice";
    var AUDIO_CLASS = "format-audio";
    var VIDEO_CLASS = "format-video";
    var FONTSIZE_SELECTOR = "#custom-fontsize";

    var UPDATE_STYLES_THROTTLE_MS = 500;

    var BACK_CLASS = "back";
    var NEXT_CLASS = "next";
    var BACK_OR_NEXT_SELECTOR = ["."+BACK_CLASS,"."+NEXT_CLASS].join(",");

    var basenames;

    var AUDIO_MIMETYPE = "audio/mp3";
    var VIDEO_MIMETYPE = "video/mp4";

    var AUDIO_FILE_EXT = ".MP3";
    var VIDEO_FILE_EXT = ".MP4";
    var TRANSCRIPT_FILE_EXT = ".VTT";

    var ABOUT_FILE_REGEXP = /about\.txt/i;
    var AUDIO_REGEXP = new RegExp(AUDIO_FILE_EXT,'i');
    var VIDEO_REGEXP = new RegExp(VIDEO_FILE_EXT,'i');
    var TRANSCRIPT_REGEXP = new RegExp(TRANSCRIPT_FILE_EXT,'i');
    
    var instructions = [
        '<p>Please select some audio ('+AUDIO_FILE_EXT+') or video ('+VIDEO_FILE_EXT+') and transcript ('+TRANSCRIPT_FILE_EXT+') files.</p>',
        '<p>The filenames of each media and transcript file should be identical.</p>',
        '<p>Browse to this folder (within htdocs):</p>'        
    ].join("");

    function showInstructions(){
        
        $("."+MEDIA_FOLDER_CLASS).val(mediaFilesFolder);
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

    function hasVideo(basename){
        return hasFileType(basename,VIDEO_FILE_EXT);
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

            if (filename.match(VIDEO_REGEXP)){
                
                basename = filename.replace(VIDEO_REGEXP,"");
                createBase(basename);
                basenames[basename].push(VIDEO_FILE_EXT);
                return true;
            }
           
            if (filename.match(TRANSCRIPT_REGEXP)){
                
                basename = filename.replace(TRANSCRIPT_REGEXP,"");
                createBase(basename);                
                basenames[basename].push(TRANSCRIPT_FILE_EXT);
                return true;
            }

            if (filename.match(ABOUT_FILE_REGEXP)){
                // ignore standard "about" file
                return true;
            }

        });

        $.each(basenames,function(basename){

            if (!hasTranscript(basename)){
                warn(basename + " is missing its VTT file");
            }

            if (!hasAudio(basename) && !hasVideo(basename)){
                warn(basename + " is missing a matching audio or video file");
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

    function clearMediaPlayer(){
        $("."+PLAYER_CLASS).html("");
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
        var filename = mediaFilesFolder + "/" + basename + TRANSCRIPT_FILE_EXT;

        $.ajax({
            url : filename,
            dataType: "text",
            success : function (data) {
                
                writeTranscript(data);
            }
        });

    }

    function createMediaTag(){
        
        clearMediaPlayer();
        
        var basename = getCurrentBasename();
        var mediaClass;
        var mimetype;
        var extension;

        if (!basename){
            console.log("No audio/video basename - cannot dispaly");
            return;
        }
        
        if (hasAudio(basename)){
            mediaClass = AUDIO_CLASS;
            mimetype = AUDIO_MIMETYPE;
            extension = AUDIO_FILE_EXT;
        } else if (hasVideo(basename)){
            mediaClass = VIDEO_CLASS;
            mimetype = VIDEO_MIMETYPE;
            extension = VIDEO_FILE_EXT;
        } else {
            info("This file has no audio");
        }

        if (!hasTranscript(basename)){
            info("This file has no transcript");
        }

        var audioHtml = [
            '<video class="',mediaClass,'" controls preload>',
                '<source type="',mimetype,'" src="',mediaFilesFolder,"/",basename,extension,'">',
                '<track label="English" kind="subtitles" srclang="en" src="',mediaFilesFolder,"/",basename,TRANSCRIPT_FILE_EXT,'" default>',
            '</video>'
        ];     

        console.info(audioHtml);

        $("."+PLAYER_CLASS).html(audioHtml.join(""));
    }

    function updatePreview(){
        clearInfo();
        createMediaTag();
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
        mediaFilesFolder = $("."+MEDIA_FOLDER_CLASS).val();
    }

    function updateFontSize(){
        var newSize = $(FONTSIZE_SELECTOR).val();
        console.log("Updated to "+newSize);
        // you cannot directly change the ::cue so we write a new style
        var style = document.createElement("style");
        style.textContent = "video::cue {font-size: "+newSize+"px;}";
        document.body.appendChild(style);

    }
    
    function enableEvents(){
        $("."+FILE_INPUT_CLASS).on('change', updateFiles);
        $(BACK_OR_NEXT_SELECTOR).on('click', backOrNext);
        $("."+SELECT_CLASS).on('change', updatePreview);
        $("."+MEDIA_FOLDER_CLASS).on('change',updateFolder);
        $("."+BACK_TO_FILES_CLASS).on('click',showInstructions);
        
        $(FONTSIZE_SELECTOR).on('change',
            $.throttle(UPDATE_STYLES_THROTTLE_MS,updateFontSize)
        );
    }
    
    function init(){
        resetFiles();
        showInstructions();
        enableEvents();
    }

    init();

}());