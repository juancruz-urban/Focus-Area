(function(){"use strict";chrome.runtime.onMessage.addListener((e,n,r)=>{if(e.type==="CAPTURE_SCREEN")return chrome.tabs.captureVisibleTab(null,{format:"png"},t=>{r({dataUrl:t})}),!0})})();
