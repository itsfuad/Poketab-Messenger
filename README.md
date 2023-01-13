# Poketab Messenger

Poketab Messenger is a temporary chat application that allows users to create and join group chats with up to 10 people. The app utilizes a unique key system to ensure privacy and security, as users can only join a chat by using a key generated and sent by the server.

## Key Features
- Create and join group chats with up to 10 people
- Share images, files, audio, and stickers with others in the chat
- Built-in audio player and recorder to play and record audio within the app
- React to messages and reply to specific messages
- Share your location with others in the chat
- All data is stored only on the device, ensuring maximum privacy and security

## Getting Started
1. Open the browser of your choice on any device and navigate to https://poketab.live
2. Once the site is loaded, create a new chat or join an existing one by using the provided key.
3. Start chatting and sharing files, images, audio, and stickers with others in the chat.
4. Use the built-in audio player and recorder to play and record audio within the app.
5. React to messages and reply to specific messages.

**Note:** Poketab Messenger is a Progressive Web App (PWA) and does not require any heavy installation. It can be accessed on any device and browser that supports web standards.

Poketab Messenger is perfect for anyone looking for a secure and temporary chat option. Give it a try today!



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
