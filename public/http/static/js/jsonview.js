var JsonFormatter = {
    htmlEncode: function(t) {
        return t != null ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;")
            .replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
    },

    decorateWithSpan: function(value, className) {
        return '<span class="' + className + '">' + this.htmlEncode(value) + '</span>';
    },

    valueToHTML: function (value) {
        var valueType = typeof value, output = "";
        if (value == null)
            output += this.decorateWithSpan("null", "type-null");
        else if (value && value.constructor == Array)
            output += this.arrayToHTML(value);
        else if (valueType == "object")
            output += this.objectToHTML(value);
        else if (valueType == "number")
            output += this.decorateWithSpan(value, "type-number");
        else if (valueType == "string")
            if (/^(http|https):\/\/[^\s]+$/.test(value))
                output += this.decorateWithSpan('"', "type-string") + '<a href="' + value + '" target="_blank">' 
                        + this.htmlEncode(value) + '</a>' + this.decorateWithSpan('"', "type-string");
            else
                output += this.decorateWithSpan('"' + value + '"', "type-string");
        else if (valueType == "boolean")
            output += this.decorateWithSpan(value, "type-boolean");

        return output;
    },
    arrayToHTML: function (json) {
        var output = '<div class="collapser"></div>[<span class="ellipsis"></span><ul class="array collapsible">';
        var length = json.length;
        
        for (var i = 0; i < length; i++) {
            output += '<li><div class="hoverable">';
            output += this.valueToHTML(json[i]);
            if (i < length - 1) output += ',';
            output += '</div></li>';
        }
        output += '</ul>]';
        var hasContents = (length > 0);
        if (!hasContents) output = "[ ]";
        return output;
    },

    objectToHTML: function(json) {
        var keys = Object.keys(json);
        var output = '<div class="collapser"></div>{<span class="ellipsis"></span><ul class="obj collapsible">';
        var length = keys.length;
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            output += '<li><div class="hoverable">';
            output += '<span class="property">' + this.htmlEncode(key) + '</span>: ';
            output += this.valueToHTML(json[key]);
            if (i < length - 1) output += ',';
            output += '</div></li>';
        }
        output += '</ul>}';
        var hasContents = (length > 0);
        if (!hasContents) output = "{ }";
        return output;
    },

    jsonToHTML: function(json, fnName) {
        var output = '';
        if (fnName)
            output += '<div class="callback-function">' + fnName + '(</div>';
        output += '<div id="jsonView">';
        output += this.valueToHTML(json);
        output += '</div>';
        if (fnName)
            output += '<div class="callback-function">)</div>';
        var div = document.createElement("div");
        div.innerHTML = output;
        return div;
    }
};

function ontoggle(event) {
    var collapsed, target = event.target;
    if (event.target.className == 'collapser') {
        collapsed = target.parentNode.getElementsByClassName('collapsible')[0];
        if (collapsed.parentNode.classList.contains("collapsed"))
            collapsed.parentNode.classList.remove("collapsed");
        else
            collapsed.parentNode.classList.add("collapsed");
    }
}

var onmouseMove = (function() {
    var lastLI;

    function onmouseOut() {
        if (lastLI) {
            lastLI.firstChild.classList.remove("hovered");
            lastLI = null;
        }
    }

    return function(event) {
        var target = event.target, element = target, str = "";
        if (element.tagName != "LI") {
            while (element && element.tagName != "LI")
                element = element.parentNode;
            if (element && element.tagName == 'LI') {
                if (lastLI && element != lastLI)
                    lastLI.firstChild.classList.remove("hovered");
                element.firstChild.classList.add("hovered");
                lastLI = element;
                do {
                    if (element.parentNode.classList.contains("array")) {
                        var index = [].indexOf.call(element.parentNode.children, element);
                        str = "[" + index + "]" + str;
                    }
                    if (element.parentNode.classList.contains("obj")) {
                        str = "." + element.firstChild.firstChild.innerText + str;
                    }
                    element = element.parentNode.parentNode.parentNode;
                } while (element.tagName == "LI");
                if (str.charAt(0) == '.')
                    str = str.substring(1);
                return;
            }
        }
        onmouseOut();
    };
})();

function jsonview(jsonObj, $container) {
    var element = JsonFormatter.jsonToHTML(jsonObj);
    $container.empty();
    $container.append(element);
    $(element).ready(function() {
        $(element).on('click', ontoggle);
        $(element).on('mouseover', onmouseMove);
    });
};

