var EasySelector = function(settings) {
    this.label = null;
    this.value = null;
    this.html = null;
    this.dom = null;
    this.isOpen = null;
    this.isOpenSettings = null;
    this.listHtmlBackup = null;
    this.listMaxHeight = null;
    this.existingValue = null;
    this.settingOptions = [];
    this.width = null;
    this.options = [];
    this.configurable = null;

    EasySelector.prototype.init.call(this, settings);
};

EasySelector.prototype.init = function(settings) {
    var defaults = {
        options: [],
        listMaxHeight: 200,
        width: 240,
        settingOptions: [],
        configurable: true
    };

    this.isOpen = false;
    this.isOpenSettings = false;
    this.dom = {};
    this.existingValue = false;

    $.extend(true, defaults, settings);

    this.setOptions(defaults.options)
        .setListMaxHeight(defaults.listMaxHeight)
        .setWidth(defaults.width)
        .setSettingOptions(defaults.settingOptions)
        .setIsConfigurable(defaults.configurable);
};

EasySelector.prototype.setIsConfigurable = function(conf) {
    this.configurable = !!conf;
    if(this.html) {
        if(!conf) {
            this.closeSettings();
            $(this.dom.settings).hide();   
        } else {
            $(this.dom.settings).show();
        }
        this.setWidth(this.width);
    }
    return this;
};

EasySelector.prototype.setWidth = function(width) {
    //Only accepts integer or percentage value
    var theWidth, buttonsWidth, $input;
    if(typeof width === 'number') {
        this.width = width;
        theWidth = width + "px";
    } else if(parseInt(width, 10)) {
        theWidth = this.width = width;
    }
    if(this.html && theWidth) {
        $input = $(this.dom.input);
        theWidth = $(this.html).css("width", theWidth).width();
        buttonsWidth = $(this.dom.arrow).outerWidth() + (this.configurable ? $(this.dom.settings).outerWidth() : 0) + 1;
        if(buttonsWidth === 1) {
            theWidth = parseInt(this.width, 10) - (this.configurable ? 56 : 36);
        } else {
            theWidth -= buttonsWidth;
            theWidth -= $input.outerWidth() - $input.width();
        }
        $input.css("width", Math.floor(theWidth) + "px");
    }
    return this;
};

EasySelector.prototype.setSettingOptions = function(settingOptions) {
    var i, option, selected = false;
    this.settingOptions = settingOptions;
    if(this.html) {
        $(this.dom.settingOptions).empty();
        for(i = 0; i < settingOptions.length; i++) {
            option = this.createHTMLOption(settingOptions[i].label, settingOptions[i].value);
            if(settingOptions[i].selected) {
                selected = true;
                $(option).addClass("selected");
            }
            this.dom.settingsPanel.appendChild(option);
        }
        if(!selected && i) {
            $(this.dom.settingsPanel.childNodes[0]).addClass('selected');
        }
    }
    return this;
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

EasySelector.prototype.addOption = function(label, value, selected) {
    this.options.push({
        label: label,
        value: value
    });

    if(this.html) {
        this.dom.list.appendChild(this.createHTMLOption(label, value));
        if(selected) {
            this.setSelectedItem(label, value);
        }
        this.listHtmlBackup = this.dom.list.cloneNode(true);
    }

    return this;
};

EasySelector.prototype.setOptions = function(options, useBackup) {
    var i;

    if(options.hasOwnProperty("length") && options.push) {
        if(this.html) {
            $(this.dom.list).empty();
        }
        if(useBackup) {
            if(this.html) {
                for(i = 0; i < this.listHtmlBackup.childNodes.length; i++) {
                    this.dom.list.appendChild(this.listHtmlBackup.childNodes[i].cloneNode(true));
                }
            }
        } else {
            this.options = [];
            for(i = 0; i < options.length; i++) {
                this.addOption(options[i].label, options[i].value, options[i].selected);
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

EasySelector.prototype.openSettings = function() {
    if(this.html && !this.isOpenSettings) {
        $(this.dom.settingsPanel).show();
        this.isOpenSettings = true;
        this.close();
    }
    return this;
};

EasySelector.prototype.open = function() {
    if(this.html && !this.isOpen) {
        this.closeSettings();
        this.dom.list.style.width = $(this.html).width() + "px";
        $(this.html).addClass("expanded");
        this.isOpen = true;
    }
    return this;
};

EasySelector.prototype.closeSettings = function() {
    if(this.html && this.isOpenSettings) {
        $(this.dom.settingsPanel).hide();
        this.isOpenSettings = false;
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
        if($(this).parents("." + that.dom.settingsPanel.className).length) {
            $(that.dom.settingsPanel).find("li.selected").removeClass("selected");
            $(this.parentElement).addClass("selected");
            that.closeSettings();
        } else if(this.parentElement && this.parentElement.tagName.toLowerCase() === 'li') {
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
                    if($('.easyselector-settings:visible').length) {
                        that.closeSettings();
                    } else {
                        that.openSettings();
                    }
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
            that.close(); 
        }).on('blur', function() {
            that.processCurrentInput();
        });

    $(document).on('click focusin', function(e) {
        if(!$(e.target).parents(that.html).length) {
            that.close();
            that.closeSettings();
        }
    });
};

EasySelector.prototype.createHTML = function() {
    var container, input, arrow, settings, list, aux, settingsPanel;

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
    aux = aux.cloneNode(true);
    settings.appendChild(aux);

    list = document.createElement('ul');
    list.className = 'easyselector-list';

    settingsPanel = document.createElement('ul');
    settingsPanel.className = 'easyselector-settings';

    container.appendChild(input);
    container.appendChild(settings);
    container.appendChild(arrow);
    container.appendChild(list);
    container.appendChild(settingsPanel);

    this.dom.input = input;
    this.dom.arrow = arrow;
    this.dom.settings = settings;
    this.dom.list = list;
    this.dom.settingsPanel = settingsPanel;

    this.html = container;

    this.setSettingOptions(this.settingOptions);
    this.setOptions(this.options);
    this.setListMaxHeight(this.listMaxHeight);
    this.setIsConfigurable(this.configurable);
    this.attachListeners();

    return this.html;
};

EasySelector.prototype.getHTML = function() {
    if(!this.html) {
        this.createHTML();
    }
    return this.html;
};

EasySelector.prototype.getValue = function() {
    return this.value;
};

EasySelector.prototype.getLabel = function() {
    return this.label;
};

EasySelector.prototype.setSettingValue = function(value) {
    var $panel = $(this.dom.settingsPanel), 
        prev = $panel.find("li.selected"),
        cur = $panel.find("a[data-value="+value+"]");

    if(cur.length) {
        cur.parent().addClass("selected");
        prev.removeClass("selected");
    }

    return this;
};

EasySelector.prototype.getSettingValue = function() {
    var setting = $(this.dom.settingsPanel).find("li.selected a").data("value");
    return setting || null;
};