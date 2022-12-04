# Poketab-Messanger
Temporary Realtime chatting application for 2-15 peoples. 

Features -
* No database / stored message.
* Dynamic chat join link which expires after no user left on that chat. 
* Image & file sharing.
* Reply to messages.
* Share your current location.


## Looking for sticker artist
+ Make some sticker art based on *Pokemon* theme and charecters. 
+ Pull request uploading images into /public/stickers/YOUR_STICKER_NAME/ folder
+ Create two subfolders named 'animated' and 'static' and put your sticker in the directories. Name your image in count from 1. 
```
    1.webp
    2.webp
    3.webp
    ...
    ...
    19.webp
    20.webp
```
> It's very important to have two folders. If your sticker is not animated then put the files both of the directories.
+ In the public/stickers/stickersConfig.js file, add your sticker name and count. Note: The list order will be followed in the sticker menu. 
```js
const Stickers = [
    {"name": "cat", "count": "29", "icon": "15"}, //sticker on the cat folder which contains 29 webp files and 15th image is the icon.
    {"name": "cutecat", "count": "33", "icon": "30"},
    {"name": "skully", "count": "26", "icon": "23"},
    {"name": "frog", "count": "30", "icon": "18"},
]
```
