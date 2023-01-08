//theme colors and backgrounds
export const themeAccent = {
	blue: {
		secondary: 'hsl(213, 98%, 57%)',
		foreground: '#e1eeff',
		msg_get: 'hsl(213, 40%, 57%)',
		msg_get_reply: 'hsl(213, 88%, 27%)',
		msg_send: 'hsl(213, 98%, 57%)',
		msg_send_reply: 'hsl(213, 35%, 27%)',
	},
	geometry: {
		secondary: 'hsl(15, 98%, 57%)',
		foreground: '#e1eeff',
		msg_get: 'hsl(15, 40%, 57%)',
		msg_get_reply: 'hsl(15, 88%, 27%)',
		msg_send: 'hsl(15, 98%, 57%)',
		msg_send_reply: 'hsl(15, 35%, 27%)',
	},
	dark_mood: {
		secondary: 'hsl(216, 37%, 44%)',
		foreground: '#e1eeff',
		msg_get: 'hsl(216, 27%, 33%)',
		msg_get_reply: 'hsl(216, 32%, 23%)',
		msg_send: 'hsl(216, 37%, 44%)',
		msg_send_reply: 'hsl(216, 20%, 21%)',
	},
	forest: {
		secondary: 'hsl(162, 60%, 42%)',
		foreground: '#e1eeff',
		msg_get: 'hsl(162, 18%, 41%)',
		msg_get_reply: 'hsl(162, 32%, 34%)',
		msg_send: 'hsl(162, 60%, 42%)',
		msg_send_reply: 'hsl(162, 14%, 27%)',
	}
};

//this array contains all the themes, which helps to traverse through the themes easily
export const themeArray = ['blue', 'geometry', 'dark_mood', 'forest'];