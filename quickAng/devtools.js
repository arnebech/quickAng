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
