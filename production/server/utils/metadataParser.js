export async function getLinkMetadata(message) {
    const regex = /https?:\/\/[^\s]+/g;
    const link = message.match(regex);
    if (link) {
        console.log(`Link: ${link[0]}`);
        const url = link[0];
        const html = await fetch(url).then((res) => res.text());
        const titleRegex = /<title[^>]*>([^<]+)<\/title>/g;
        const descriptionRegex = /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/g;
        const imageRegex = /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/g;
        const title = titleRegex.exec(html)?.[1] || '';
        const description = descriptionRegex.exec(html)?.[1] || '';
        const image = imageRegex.exec(html)?.[1] || '';
        //console.log(`Title: ${title}`);
        //console.log(`Description: ${description}`);
        //console.log(`Image: ${image}`);
        //console.log(`Url ${url}`);
        return {
            success: true,
            data: {
                title,
                description,
                image,
                url,
            },
        };
    }
    else {
        console.error('No valid links found in the message.');
        return {
            success: false,
            error: 'No valid links found in the message',
        };
    }
}
//# sourceMappingURL=metadataParser.js.map