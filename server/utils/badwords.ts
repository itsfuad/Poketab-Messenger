const badWords: Record<string, boolean> = {
    'fuck': true,
    'sex': true,
    'dick': true,
    'vagina': true,
    'cum': true,
    'boob': true,
    'anal': true,
    'horny': true,
    'gangbang': true,
    'baal': true,
    'abal': true,
    'bhodai': true,
    'vodai': true,
    'khanki': true,
    'magi': true,
    'kutta': true,
    'hoga': true,
    'rape': true,
    'porn': true,
    'dildo': true,
    'vibrator': true,
};

export function filterMessage(message: string): { containsBadWords: boolean; filteredMessage: string } {
    const words = message.split(' ');
    let containsBadWords = false;
    const filteredWords = words.map(word => {
        const lowerCaseWord = word.toLowerCase();
        if (badWords[lowerCaseWord]) {
            containsBadWords = true;
            const firstLetter = word[0];
            const lastLetter = word[word.length - 1];
            const censoredPart = '*'.repeat(word.length - 2); // Replacing characters with '*'
            return `${firstLetter}${censoredPart}${lastLetter}`;
        }
        return word;
    });

    return {
        containsBadWords,
        filteredMessage: filteredWords.join(' ')
    };
}