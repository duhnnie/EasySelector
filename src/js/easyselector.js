var EasySelector = function(settings) {
    this.label = null;
    this.value = null;
    this.html = null;
    this.dom = null;
    this.isOpen = null;
    this.listHtmlBackup = null;
    this.listMaxHeight = null;
    this.existingValue = null;
    this.options = [];

    EasySelector.prototype.init.call(this, settings);
};

EasySelector.prototype.init = function(settings) {
    this.isOpen = false;
    this.dom = {};
    this.options = settings.options;
    this.existingValue = false;
    this.listMaxHeight = 200;
};

EasySelector.prototype.setListMaxHeight = function(height) {
    if(typeof height === 'number') {
        this.listMaxHeight = height;
        if(this.html) {
            $(this.dom.list).css("max-height", height + "px");
        }
    }
    return this;
};

EasySelector.prototype.createHTMLOption = function(label, value) {
    var listItem, link;

    listItem = document.createElement("li");
    link = document.createElement('a');
    link.appendChild(document.createTextNode(label));
    link.setAttribute("data-value", value);
    link.href = "#";
    listItem.appendChild(link);

    return listItem;
};

EasySelector.prototype.setOptions = function(options, useBackup) {
    var i;

    if(options.hasOwnProperty("length") && options.push) {
        this.options = options;

        if(this.html) {
            $(this.dom.list).empty();
            if(useBackup) {
                for(i = 0; i < this.listHtmlBackup.childNodes.length; i++) {
                    this.dom.list.appendChild(this.listHtmlBackup.childNodes[i].cloneNode(true));
                }
            } else {
                for(i = 0; i < options.length; i++) {
                    this.dom.list.appendChild(this.createHTMLOption(options[i].label, options[i].value));
                }
                this.listHtmlBackup = this.dom.list.cloneNode(true);
            }
        }
    }

    return this;
};

EasySelector.prototype.processCurrentInput = function() {
    var input, i;
    if(this.html) {
        input = $.trim(this.dom.input.value).toLowerCase();
        if(input) {
            for(i = 0; i < this.options.length; i++) {
                if(this.options[i].label === input) {
                    this.setSelectedItem(this.options[i].label, this.options[i].value);
                    return this;
                }
            }
        }    
    }

    this.setSelectedItem("", "");

    return this;
};

EasySelector.prototype.open = function() {
    if(this.html && !this.isOpen) {
        this.dom.list.style.width = $(this.html).width() + "px";
        $(this.html).addClass("expanded");
        this.isOpen = true;
    }
    return this;
};

EasySelector.prototype.close = function() {
    if(this.html && this.isOpen) {
        $(this.html).removeClass("expanded");
        this.isOpen = false;
        if(!this.existingValue) {
            this.processCurrentInput();
        }
    }
    return this;
};

EasySelector.prototype.setSelectedItem = function(label, value) {
    this.label = label;
    this.value = value;

    if(this.html) {
        this.dom.input.value = label;
    }
    this.existingValue = true;

    return this;
};

EasySelector.prototype.showSuggestions = function(text) {
    var i, textLength, msg, showing = 0;
    this.existingValue = false;
    if(this.html && typeof text === 'string') {
        if(text) {
            text = text.toLowerCase();
            textLength = text.length;
            $(this.dom.list).empty();
            for(i = 0; i < this.options.length; i++) {
                if(this.options[i].label.substr(0, textLength).toLowerCase() === text || this.options[i].value.substr(0, textLength).toLowerCase() === text) {
                    this.dom.list.appendChild(this.createHTMLOption(this.options[i].label, this.options[i].value));
                    showing += 1;
                }
            }
            if(!showing) {
                msg = document.createElement('li');
                msg.className = 'message';
                msg.appendChild(document.createTextNode("No similar options"));
                this.dom.list.appendChild(msg);
            }
        } else {
            this.setOptions(this.options, true);
        }
        this.open();
    }
    return this;
};

EasySelector.prototype.searchSuggestionsHandler = function() {
    var that = this;
    return function(e) {
        if(e.keyCode !== 27) {
            that.showSuggestions($.trim(this.value));
        }
    };
};

EasySelector.prototype.attachListeners = function() {
    var that = this;
    $(this.html).on('click', 'a', function(e) {
        e.preventDefault();
        if(this.parentElement && this.parentElement.tagName.toLowerCase() === 'li') {
            //is a list element
            that.setSelectedItem(this.textContent, $(this).data("value"));
            that.close();
        } else {
            switch(this.className) {
                case 'easyselector-arrow':
                    //is the display/hide arrow button
                    if(that.isOpen) {
                        that.close();
                    } else {
                        that.setOptions(that.options, true);
                        that.open();   
                    }
                    break;
                case 'easyselector-conf':
                    //is the configuration button
                    break;
            }
        }
    });

    $(this.dom.input).on('keyup', that.searchSuggestionsHandler())
        .on('keydown', function(e) {
            if(e.keyCode === 27) {
                that.setSelectedItem("", "");
                that.close();
            } else if(e.keyCode === 13) {
                $(this).trigger("blur");
            }
        }).on('focus', function() {
            that.setOptions(that.options, true);
            that.open();
        }).on('change', function(){
            /*console.log(that.isOpen ? 'abierto' : 'cerrado');
            console.log(this.value);*/
            //that.processCurrentInput();
            that.close(); 
        }).on('blur', function() {
            //this.value = "";
            that.processCurrentInput();
        });

    $(document).on('click focusin', function(e) {
        if(!$(e.target).parents(that.html).length) {
            that.close();
        }
    });
};

EasySelector.prototype.createHTML = function() {
    var container, input, arrow, settings, list, aux;

    if(this.html) {
        return html;
    }

    container = document.createElement('div');
    container.className = 'easyselector';

    input = document.createElement('input');
    input.type = 'text';

    arrow = document.createElement('a');
    arrow.className = 'easyselector-arrow';
    arrow.href = '#';
    aux = document.createElement('div');
    aux.innerHTML = "&nbsp;";
    arrow.appendChild(aux);

    settings = document.createElement("a");
    settings.className = 'easyselector-conf';
    settings.href = '#';
    aux = document.createElement("img");
    aux.align = 'absmiddle';
    aux.src = 'http://cdn3.iconfinder.com/data/icons/token/Token,%20128x128,%20PNG/Gear.png';
    settings.appendChild(aux);

    list = document.createElement('ul');

    container.appendChild(input);
    container.appendChild(arrow);
    container.appendChild(settings);
    container.appendChild(list);

    this.dom.input = input;
    this.dom.arrow = arrow;
    this.dom.settings = settings;
    this.dom.list = list;

    this.html = container;

    this.setOptions(this.options);
    this.setListMaxHeight(this.listMaxHeight);
    this.attachListeners();

    return this.html;
};

EasySelector.prototype.getHTML = function() {
    return this.createHTML();
};