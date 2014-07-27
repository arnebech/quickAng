console.log('background');


var connections = [];

chrome.runtime.onConnect.addListener(function(devToolsConnection) {
    // assign the listener function to a variable so we can remove it later

    var tabId = -1

    var devToolsListener = function(message, sender, sendResponse) {
  		console.log('got dev tools message', message)

  		tabId = message.tabId
  		connections[tabId] = devToolsConnection

    }

    // var index = listeners.length;
    // listeners.push(devToolsConnection);
    // console.log('adding dev tool connection');

    // console.log(devToolsConnection)

    devToolsConnection.postMessage({msg: 'ready'})

    // add the listener
    devToolsConnection.onMessage.addListener(devToolsListener);

    devToolsConnection.onDisconnect.addListener(function() {
         devToolsConnection.onMessage.removeListener(devToolsListener);
         if (tabId != -1) {
	         connections[tabId] = null
	         console.log('disconnected !')
	     }
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (changeInfo.status === 'complete') {
        // console.log('bongo')
        if (connections[tabId]) {
        	connections[tabId].postMessage({msg: 'reloaded'});
        }
    }
});

console.group('my oboject')
console.log('abc: 123')
console.group('items')
console.log('a')
console.groupEnd()
console.groupEnd()