var all = function() {

    window.$reloadCSS = function reloadStylesheets() {
        var queryString = '?reload=' + new Date().getTime();

        links = document.querySelectorAll('link[rel="stylesheet"]');
        links=Array.prototype.slice.call(links);
        links.forEach(function(link){
            link.href = link.href.replace(/\?.*|$/, queryString);
        });
    };

    window.$pp = function(obj) {
        console.log(JSON.stringify(obj, false, '  '));
    };

    window.$savepromise = function(name) {
        if (!name) {
            name = '_promise'
        }
        return function(firstArg) {
            window[name] = firstArg;
            console.log(firstArg)
            console.log('stored first arg in ' + name)
        }
    }

    // object.watch
    // modified from https://gist.github.com/eligrey/384583
    if (!Object.prototype.watch) {
        Object.defineProperty(Object.prototype, "watch", {
            enumerable: false,
            configurable: true,
            writable: false,
            value: function (prop, handler) {

                var oldval = this[prop];
                var newval = oldval;
                var getter = function () {
                    return newval;
                };
                var setter = function (val) {
                    oldval = newval;
                    return newval = handler.call(this, val, oldval, prop); //non-std arg order
                };
                
                if (delete this[prop]) { // can't watch constants
                    Object.defineProperty(this, prop, {
                          get: getter
                        , set: setter
                        , enumerable: true
                        , configurable: true
                    });
                } else {
                    console.log("failed to setup watch")
                }
            }
        });
    }
     
    // object.unwatch
    if (!Object.prototype.unwatch) {
        Object.defineProperty(Object.prototype, "unwatch", {
            enumerable: false,
            configurable: true,
            writable: false,
            value: function (prop) {
                var val = this[prop];
                delete this[prop];
                this[prop] = val;
            }
        });
    }

    window.$debugObjProp = function(obj, prop) {
        obj.watch(prop, function(newVal){
            debugger; 
            return newVal;
        })
    }

}

var loadUtils = function() {
    chrome.devtools.inspectedWindow.eval('('+all.toString() + ')();');
}

loadUtils();


var script = [
    "if (typeof angular !== undefined && $0) {",
    "  $s = angular.element($0).scope();",
    "  $is = angular.element($0).isolateScope();",
    "}"
].join('\n');

function createAlias() {
    chrome.devtools.inspectedWindow.eval(script);
}

chrome.devtools.panels.elements.onSelectionChanged.addListener(createAlias);

createAlias();


var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

backgroundPageConnection.onMessage.addListener(function (message) {
    // Handle responses from the background page, if any
    if (message.msg === 'ready') {
        backgroundPageConnection.postMessage({
            msg: 'register',
            tabId: chrome.devtools.inspectedWindow.tabId 
        });
    } else if (message.msg === 'reloaded') {
        loadUtils()
    }
});

