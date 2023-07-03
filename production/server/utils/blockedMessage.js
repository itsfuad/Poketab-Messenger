import { blockedIcon } from "./blockedIcon.js";
export const blockedMessage = `
<style>
    * {margin: 0; padding: 0; font-family: sans-serif; box-sizing: border-box; user-select: none;}
    body{background-color: #111d2a; color: ghostwhite;}
</style>
<link rel="icon" href="${blockedIcon}">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0, interactive-widget=resizes-content">
<title>IP Blocked</title>
<div style="display: flex; align-items: center; justify-content: center; flex-direction: row; gap: 10px; height: 100%; width: 100%">
    <div style="border-right: 3px solid ghostwhite; font-size: 4rem; padding: 10px; color: #ffffff3d;">429</div>
    <div style="white-space: break-spaces; font-size: 0.8rem;">Too many requests.\nYour IP is blocked by Poketab.\nGrab a cup of coffee and try again later☕</div>
</div>
`;
//# sourceMappingURL=blockedMessage.js.map