# Audio transcript preview tool

If you're comfortable using Git and installing software like Node,
 read the instructions under the "Developer" heading below.

Otherwise, to run this tool you need to start a simple web server.
 This is a little easier on Mac than Windows. Please follow the instructions
 for your platform.

## Windows

On Windows without admin rights, download the following portable open source server software:

[http://miniweb.sourceforge.net/](http://miniweb.sourceforge.net/)

Extract `miniweb.exe` to the current folder.

Then run `start.bat`. This should open Chrome and show the tool.

However, the IP address used by Miniweb is unpredictable. If the tool does not load,
 type the IP address listed in the "start.bat" command window into the address bar in Chrome e.g.
 `10.228.155.56:8000`.

## Mac

If you're on Mac or have [Python 2 installed globally](http://docs.python-guide.org/en/latest/starting/install/win/) on Windows.

Navigate to this folder in the [terminal](https://www.wikihow.com/Open-a-Terminal-Window-in-Mac).
 This can be done from Finder if you change a [system preference](https://www.macworld.com/article/1161876/open_finder_folder_in_terminal.html).

Run the following command:

   python -m SimpleHTTPServer 4000

Open [http://localhost:4000/htdocs](http://localhost:4000/htdocs) in Chrome.

## Developer

Install Node and NPM:

[https://docs.npmjs.com/getting-started/installing-node](https://docs.npmjs.com/getting-started/installing-node)

Open a command prompt, navigate to this folder and run:

   npm install

Then:

  npm run dev

Finally, open [http://localhost:4000](http://localhost:4000) in Chrome.

## Adding audio or video files

Add MP3/MP4 and matching VTT files to the `AUDIO_AND_VIDEO_FILES` directory.

Each file and its matching mp3 or mp4 should have exactly the same
 filename (only the ".mp3"/".mp4" or ".vtt" file extension should
  distinguish the files.)

## Running a preview

In Chrome click "Choose Files" then navigate to the 
 `AUDIO_AND_VIDEO_FILES` folder and open all the files. The preview should begin.