package main

import (
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"html/template"
	"time"
)


var avList []string = []string{
  "articuno",
  "bellsprout",
  "blastoise",
  "bulbasaur2",
  "bullbasaur",
  "caterpie",
  "charizard",
  "charmander",
  "charmander2",
  "dratini",
  "eevee",
  "haunter",
  "ivysaur",
  "jigglypuff",
  "mankey",
  "meowth",
  "mew",
  "mewtwo",
  "palkia",
  "pichu",
  "pidgey",
  "pikachu",
  "psyduck",
  "raichu",
  "rattata",
  "rayquaza",
  "snorlax",
  "squirtle",
  "squirtle2",
  "zubat"}

var Response403 string = `
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0">
  </head>
  <body>
  <style>
	  @font-face {
		  font-family: 'Comforter';
		  src: url("/fonts/comforter.woff2") format("woff2");
	  }
	  @font-face {
		  font-family: 'montserratregular';
		  src: url('/fonts/montserrat-regular-webfont.woff2') format('woff2');
		  font-weight: normal;
		  font-style: normal;
	  }
	  *{
		  margin: 0;
		  padding: 0;
		  box-sizing: border-box;
	  }
	  body{
		  overflow: hidden;
	  }
	  .container{
		  display: flex;
		  flex-direction: column;
		  align-items: center;
		  justify-content: center;
		  width: 100vw;
		  height: 100vh;
		  background: #111d2a;
		  overflow: hidden;
		  font-family: Montserrat;
	  }
	  .error{
		  font-family: 'Comforter';
		  font-size: 12rem;
		  color: #3E5968;
	  }
	  .text{
		  font-family: 'montserratregular';
		  font-size: 2.5rem;
		  color: white;
		  position: absolute;
	  }
	  a{
		  color: #506f80;
		  text-decoration: none;
		  padding: 10px 20px;
		  border: 2px solid;
		  cursor: pointer;
	  }
  </style>
  <div class="container">
	  <div class="error">403</div>
	  <div class="text">Access denied</div>
	  <a href="/">Go Back</a>
  </div>
  </body>
  `
  
var Response404 string = `
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0">
  </head>
  <body>
  <style>
	  @font-face {
		  font-family: 'Comforter';
		  src: url("/fonts/comforter.woff2") format("woff2");
	  }
	  @font-face {
		  font-family: 'montserratregular';
		  src: url('/fonts/montserrat-regular-webfont.woff2') format('woff2');
		  font-weight: normal;
		  font-style: normal;
	  }
	  *{
		  margin: 0;
		  padding: 0;
		  box-sizing: border-box;
	  }
	  body{
		  overflow: hidden;
	  }
	  .container{
		  display: flex;
		  flex-direction: column;
		  align-items: center;
		  justify-content: center;
		  width: 100vw;
		  height: 100vh;
		  background: #111d2a;
		  overflow: hidden;
		  font-family: Montserrat;
	  }
	  .error{
		  font-family: 'Comforter';
		  font-size: 12rem;
		  color: #3E5968;
	  }
	  .text{
		  font-family: 'montserratregular';
		  font-size: 2.5rem;
		  color: white;
		  position: absolute;
	  }
	  a{
		  color: #506f80;
		  text-decoration: none;
		  padding: 10px 20px;
		  border: 2px solid;
		  cursor: pointer;
	  }
  </style>
  <div class="container">
	  <div class="error">404</div>
	  <div class="text">Page not found</div>
	  <a href="/">Go Back</a>
  </div>
  </body>
  `

func isRealString(str string) bool {
	return len(str) > 0
}

func validateUserName(username string) bool {
	//format: 3-20 charecter, no space, no special charecter except unicode u0980-u09FF
	if len(username) < 3 || len(username) > 20 {
		return false
	}
	for _, c := range username {
		if c < 0x0980 || c > 0x09FF {
			return false
		}
	}
	return true
}

func makeid(count int) string{
	var text string
	var possible string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	//generate random string with keyformat
	for i := 0; i < count; i++ {
		if i % 3 == 0 && i != 0 {
			text += "-"
		}
		text += string(possible[rand.Intn(len(possible))])
	}
	return text
}

//regex
var keyformat = regexp.MustCompile(`^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$`)


//user class
type User struct {
    users [][]string
	MaxUser map[string]int
}

func (user *User) addUser(uid string, name string, key string, avatar string, maxuser int) []string {
	//fmt.Println("add user")
	//fmt.Println(uid, name, key, avatar, maxuser)
	//if maxuser not initialized
	if user.MaxUser == nil {
		//fmt.Println("maxuser not initialized")
		user.MaxUser = make(map[string]int)
	}
	user.MaxUser[key] = maxuser
	usr := []string{uid, name, key, avatar}
	user.users = append(user.users, usr)
	fmt.Println(user.users)
	return usr
}

func (user User) removeUser(uid string) []string{
	usr := user.getUser(uid)
	if usr != nil {
		//empty array of array
		for i, u := range user.users {
			if u[0] == uid {
				user.users = append(user.users[:i], user.users[i+1:]...)
				return usr
			}
		}
	}
	return []string{}
}

func (user User) getUser(uid string) []string{
	for _, usr := range user.users {
		if usr[0] == uid {
			return usr
		}
	}
	return nil
}

func (user User) getUserList(key string) []string{
	var users []string
	for _, usr := range user.users {
		if usr[2] == key {
			users = append(users, usr[1])
		}
	}
	return users
}

func (user User) getAllUserDetails(key string) [][]string{
	var users [][]string
	for _, usr := range user.users {
		if usr[2] == key {
			users = append(users, usr)
		}
	}
	return users
}

func (user User) getAvatarList(key string) []string{
	var avatars []string
	for _, usr := range user.users {
		if usr[2] == key {
			avatars = append(avatars, usr[3])
		}
	}
	return avatars
}

func (user User) getMaxUser(key string) int{
	//fmt.Println("get max user", key, user.MaxUser[key])
	return user.MaxUser[key]
}

func (user User) removeMaxUser(key string){
	delete(user.MaxUser, key)
}

func (user User) getUserIdList(key string) []string{
	var users []string
	for _, usr := range user.users {
		if usr[2] == key {
			users = append(users, usr[0])
		}
	}
	return users
}

type cred struct {
	using bool
	created int64
	ip string
}

var keys map[string]cred
var uids map[string]cred

func deleteKeys(){
	for key, value := range keys {
		if (value.using != true && time.Now().Unix() - value.created > 120000){
			delete(keys, key)
			fmt.Println("Key ", key, " deleted")
		}
	}
}

type Text struct{
	text string
}

func eq(a string, b string){
	fmt.Println(a, b)
}

func baseHandler(w http.ResponseWriter, r *http.Request){
	//serve templates
	t, err := template.ParseFiles("./../public/views/join.html", "./../public/views/create.html", "./../public/views/chat.html", "./../public/views/layout/avatars.html", "./../public/views/layout/entryfooter.html", "./../public/views/layout/entryheader.html", "./../public/views/layout/mainheader.html")
	if err != nil {
		fmt.Println(err)
	}else{
		fmt.Print("template parsed")
		fmt.Println(t)
		t.Execute(w, map[string]string{"Message": "Hello", "Name": "Fuad"})
	}

}

func main(){
	//express like server
	version := "15.0.0"
	//port := os.Getenv("PORT") or 3000
	//devMode := true

	port := "3000"
	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	}

	keys = make(map[string]cred)
	uids = make(map[string]cred)
	//run deleteKeys every 1 minute
	go func() {
		for {
			deleteKeys()
			time.Sleep(1 * time.Second)
		}
	}()

	//load the ejs template engine
	
	//make http server
	http.FileServer(http.Dir("public"))
	http.HandleFunc("/", baseHandler)
	//run at port 3000
	http.ListenAndServe(":" + port, nil)

	fmt.Println("server started on port: ", port, " - version: ", version)
}
