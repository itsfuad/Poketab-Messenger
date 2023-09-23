type ThemeAccent = {
    [key: string]: {
        secondary: string;
        foreground: string;
        msg_get: string;
        msg_get_reply: string;
        msg_send: string;
        msg_send_reply: string;
        quickEmoji: string;
    };
};


//theme colors and backgrounds
export const themeAccent: ThemeAccent = {
    'blue': {
        secondary: 'hsl(213, 98%, 57%)',
        foreground: '#e1eeff',
        msg_get: 'hsl(213, 40%, 57%)',
        msg_get_reply: 'hsl(213, 88%, 27%)',
        msg_send: 'hsl(213, 98%, 57%)',
        msg_send_reply: 'hsl(213, 35%, 27%)',
        quickEmoji: '🥶',
    },
    'ocean': {
        secondary: 'hsl(187, 100%, 37%)',
        foreground: '#e1eeff',
        msg_get: 'hsl(187, 40%, 57%)',
        msg_get_reply: 'hsl(187, 85%, 20%)',
        msg_send: 'hsl(187, 100%, 37%)',
        msg_send_reply: 'hsl(187, 40%, 32%)',
        quickEmoji: '🐳',
    },
    'cyberpunk': {
        secondary: 'hsl(233, 100%, 71%)',
        foreground: '#e1eeff',
        msg_get: 'hsl(233, 40%, 57%)',
        msg_get_reply: 'hsl(233, 64%, 30%)',
        msg_send: 'hsl(233, 100%, 71%)',
        msg_send_reply: 'hsl(233, 24%, 32%)',
        quickEmoji: '👾',
    },
    'geometry': {
        secondary: 'hsl(15, 98%, 57%)',
        foreground: '#e1eeff',
        msg_get: 'hsl(15, 40%, 57%)',
        msg_get_reply: 'hsl(15, 88%, 27%)',
        msg_send: 'hsl(15, 98%, 57%)',
        msg_send_reply: 'hsl(15, 35%, 27%)',
        quickEmoji: '🔥',
    },
    'blackboard': {
        secondary: 'hsl(216, 37%, 44%)',
        foreground: '#e1eeff',
        msg_get: 'hsl(216, 27%, 33%)',
        msg_get_reply: 'hsl(216, 32%, 23%)',
        msg_send: 'hsl(216, 37%, 44%)',
        msg_send_reply: 'hsl(216, 20%, 21%)',
        quickEmoji: '👽',
    },
    'forest': {
        secondary: 'hsl(162, 60%, 42%)',
        foreground: '#e1eeff',
        msg_get: 'hsl(162, 18%, 41%)',
        msg_get_reply: 'hsl(162, 32%, 27%)',
        msg_send: 'hsl(162, 60%, 42%)',
        msg_send_reply: 'hsl(162, 14%, 27%)',
        quickEmoji: '🍃',
    }
};