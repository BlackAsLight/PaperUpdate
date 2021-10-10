# PaperUpdate

This Node.JS program checks if your papermc server's jar file is up to date, within the relevant version group (1.15, 1.16, 1.17, etc), and if downloads it's replacement. It will exclude any build released within the last 24 hours from it's results.

The name of the file it ends up with will be it's project name with the jar extension all in lower case so your startup script might need to be adjusted to account for that.
i.e. `paper.jar`, `waterfall.jar`, etc

## Instructions

### Setup

1. Download this program onto the computer you wish to use it on.
2. Open up a terminal and direct yourself to the downloaded folder's contents using `cd`.
3. Type `npm run build` to install the necessary dependencies and compile the program.

### Run

 - Type `node main.js -<project type> <path>` to execute the program.
   - Example: `node main.js -paper /home/ubuntu/server/`
 - Replace <project type> with the type of papermc server you're running.
 - Replace <path> with the path to your server folder.
 - You can do multiple `-<project type> <path>` after `node main.js` if there are multiple servers you'd wish to have checked and updated.
   - Example: `node main.js -paper /home/ubuntu/subServer/ -waterfall /home/ubuntu/hostServer/`
   
 If you'd like this program to check on a regular basis for updates then you could set up a crontab to have it run once a day or once a week.
