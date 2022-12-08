## Welcome to Poketab Messanger

This is a realtime instant dynamic chatting WebApp which you can use for secret chatting. You can join from 2 to upto 15 peoples. 


### Features

+ Instant messaging.
+ Image support without loosing quality.
+ Reacts and replies.
+ User friendly UI.


### How it works?
+ Poketab uses temporary dynamic keys that allow users to authenticate and join chats. Other intruders cannot see any of the text or media messages and also cannot access media files from the download link if he does not have the key. So do not share the key with anyone.
+ When two or more users join the chat they can share messages between them which are secured and encrypted. First the message gets delivered to the server then the sender gets acknowledgement that the message has been sent from his device. Then the server sends the message to all other connected clients.
+ The other client gets a notification if he is not on the app or web tab active when he receives the message. Otherwise a 'seen' event gets triggered and notifies the server that he has seen the message. Then the server shares this info with all other connected clients.
+ When a client sends an image, first a low resolution image of that image is generated and then sent to all other clients by the server. So all other clients get an instant blurred image while the original image is being uploaded to the server. A dynamic link is generated to download the file when upload is complete. The link is then shared with all other clients, and the other clients use the link to load the full resolution image. 
+ File upload uses the same mechanism.



To add or change anything, pull request and our admins will varify the changes then will merge your code.
**Avoid using 3rd party libraries for simple tasks. Try to use Pure Javascript as possible.**



