# Poketab Messenger 
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/itsfuad/Poketab-Messenger?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/itsfuad/Poketab-Messenger)
![GitHub contributors](https://img.shields.io/github/contributors/itsfuad/Poketab-Messenger?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/itsfuad/Poketab-Messanger?style=flat-square)
[![DeepScan grade](https://deepscan.io/api/teams/20528/projects/23967/branches/733333/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=20528&pid=23967&bid=733333)

![GitHub](https://img.shields.io/github/license/itsfuad/Poketab-Messenger?style=flat-square)
![Website](https://img.shields.io/website?down_color=Red&down_message=Offline&style=flat-square&up_color=green&up_message=Online&url=https%3A%2F%2Fpoketab.live)

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



## Run on your own local machine

To run locally, follow these steps:

1. Clone the repository
2. Install dependencies using `npm install`
3. Start the development server using `npm run dev`
4. Open the app in your browser at `http://localhost:3000`

To build the production version:

1. Type `npm run build` to compile all frontend `javascript` code to a single js bundle.
2. Type `tsc` to compile all `typescript` code into `javascript`
3. Commit
4. Deploy
You cannot use the link outside your local network. To access from outside your local network you may use `ssl tunneling` or `port forwarding`. But that is very complex to setup. You can use `ngrok` instead or other similar solutions. 

## Contribute

To contribute to this project, follow these steps:

1. Fork the repository
2. Create a new branch using `git checkout -b my-feature-branch`
3. Make changes and commit them using `git commit -m "Add some feature"`
4. Push changes to your fork using `git push origin my-feature-branch`
5. Create a pull request

### Add more stickers
+ Copy images into `/public/stickers/YOUR_STICKER_NAME/` folder
+ Create two subfolders named `animated` and `static` and put your sticker in the directories. Name your image in count from 1. 
```
    1.webp
    2.webp
    3.webp
    ...
    ...
    19.webp
    20.webp
```
It's very important to have two folders. If your sticker is not animated then put the files both of the directories.
In the `./public/stickers/stickersConfig.js` file, add your sticker name and count. 

**Note: The list order will be followed in the sticker menu.**
```js
const Stickers = [
    {"name": "cat", "count": "29", "icon": "15"}, //sticker on the cat folder which contains 29 webp files and 15th image is the icon.
    {"name": "cutecat", "count": "33", "icon": "30"},
    {"name": "skully", "count": "26", "icon": "23"},
    {"name": "frog", "count": "30", "icon": "18"},
]
```

## Credits
Lead Developer [Fuad Hasan](https://github.com/itsfuad).

Email: support@poketab.live
