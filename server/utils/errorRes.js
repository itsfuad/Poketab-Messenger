const Response403 = `
<body>
<style>
    @font-face {
        font-family: 'Comforter';
        src: url("/fonts/comforter.woff2");
    }
    @font-face {
        font-family: 'montserratregular';
        src: url('/fonts/montserrat-regular-webfont.woff2') format('woff2'),
            url('/fonts/montserrat-regular-webfont.woff') format('woff');
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
`;

const Response404 = `
<body>
<style>
    @font-face {
        font-family: 'Comforter';
        src: url("/fonts/comforter.woff2");
    }
    @font-face {
        font-family: 'montserratregular';
        src: url('/fonts/montserrat-regular-webfont.woff2') format('woff2'),
            url('/fonts/montserrat-regular-webfont.woff') format('woff');
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
`;

module.exports = {
    Response403,
    Response404
};