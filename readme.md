# Audio transcript preview tool

## Windows within admin rights

On Windows without admin rights, run start.bat. If this fails,
 open the IP address listed in the "start.bat" command window in Chrome e.g.
 `10.228.155.56:8000`.

## Mac or Windows with admin rights

Install Node and NPM:

[https://docs.npmjs.com/getting-started/installing-node](https://docs.npmjs.com/getting-started/installing-node)

Open a command prompt, navigate to this folder and run:

   npm install

After all installs have completed, run:

  npm run tool

## Adding audio or video files

Add MP3/MP4 and matching VTT files to the `AUDIO_AND_VIDEO_FILES` directory.

Each file and its matching mp3 or mp4 should have exactly the same
 filename (only the ".mp3"/".mp4" or ".vtt" file extension should
  distinguish the files.)
  
## Running a preview

In Chrome click "Choose Files" then navigate to the 
 `AUDIO_AND_VIDEO_FILES` folder and open all the files. The preview should begin.