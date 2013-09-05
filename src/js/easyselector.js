/*global $ */
var EasySelector = function(settings) {
    this.id = null;
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
    this.settingValue = null;
    this.settingsButtonTooltip = null;
    this.settingsPanelWidth = null;
    this.onChange = null;
    this.onSettingValueChange = null;
    this.onSettingsPanelOpen = null;
    this.onSettingsPanelClose = null;
    this.onOptionsPanelOpen = null;
    this.onOptionsPanelClose = null;
    this.htmlCreationProcessFinished = null;
    this.language = null;

    EasySelector.prototype.init.call(this, settings);
};

EasySelector.prototype.init = function(settings) {
    var defaults = {
        options: [],
        listMaxHeight: 200,
        width: 240,
        settingOptions: [],
        configurable: true,
        settingValue: null,
        settingsButtonTooltip: 'settings',
        settingsPanelWidth: null,
        onSettingValueChange: null,
        onChange: null,
        onSettingsPanelOpen: null,
        onSettingsPanelClose: null,
        onOptionsPanelOpen: null,
        onOptionsPanelClose: null,
        id: Math.floor(Math.random()*10000000000000000),
        language: {
            NO_SIMILAR_OPTIONS: "No similar options"
        }
    };

    this.isOpen = false;
    this.isOpenSettings = false;
    this.dom = {};
    this.existingValue = false;
    this.language = defaults.language;

    $.extend(true, defaults, settings);

    this.onSettingValueChange = defaults.onSettingValueChange;
    this.onSettingsPanelOpen = defaults.onSettingsPanelOpen;
    this.onSettingsPanelClose = defaults.onSettingsPanelClose;
    this.onOptionsPanelOpen = defaults.onOptionsPanelOpen;
    this.onOptionsPanelClose = defaults.onOptionsPanelClose;
    this.onChange = defaults.onChange;
    this.id = defaults.id;
    this.htmlCreationProcessFinished = false;

    this.setSettingsButtonTooltip(defaults.settingsButtonTooltip)
        .setSettingsPanelWidth(defaults.settingsPanelWidth)
        .setOptions(defaults.options)
        .setListMaxHeight(defaults.listMaxHeight)
        .setWidth(defaults.width)
        .setSettingOptions(defaults.settingOptions)
        .setIsConfigurable(defaults.configurable)
        .setSettingValue(defaults.settingValue || "[first]");
};

EasySelector.prototype.setSettingsPanelWidth = function(width) {
    if(typeof width === 'number') {
        this.settingsPanelWidth = width;
        if(this.dom && this.dom.settingsPanel) {
            this.dom.settingsPanel.style.width = width + 'px';
        }
    }

    return this;
};

EasySelector.prototype.setSettingsButtonTooltip = function(tooltipLabel) {
    this.settingsButtonTooltip = tooltipLabel;
    if(this.html) {
        this.dom.settings.title = tooltipLabel;
    }
    return this;
};

EasySelector.prototype.setIsConfigurable = function(conf) {
    this.configurable = !!conf;
    if(this.html) {
        if(!conf) {
            this.closeSettings();
            $(this.dom.settings).hide();
            $(this.dom.arrow).css("right", "0px");
        } else {
            $(this.dom.settings).show();
            $(this.dom.arrow).css("right", "");
        }
        this.setWidth(this.width);
    }
    return this;
};

EasySelector.prototype.setWidth = function(width) {
    //Only accepts integer or percentage value
    var theWidth, buttonsWidth, $input, dummy;
    if(typeof width === 'number') {
        this.width = width;
        theWidth = width + "px";
    } else if(parseInt(width, 10)) {
        theWidth = this.width = width;
    }
    if(this.html && theWidth) {
        $input = $(this.dom.input);
        $(this.html).css("width", theWidth);
        if(!/^\d+(\.\d+)*%$/.test(theWidth)) {
            theWidth = $(this.html).css("width", theWidth).width();
            if(this.html.parentElement) {
                buttonsWidth = $(this.dom.arrow).outerWidth() + (this.configurable ? $(this.dom.settings).outerWidth() : 0) + 1;
            } else {
                dummy = this.html.cloneNode(true);
                dummy.style.display = 'none';
                document.body.appendChild(dummy);
                buttonsWidth = $(dummy).find('.easyselector-arrow').outerWidth() + (this.configurable ? $(dummy).find('.easyselector-conf').outerWidth() : 0) + 1;
                theWidth = $(dummy).width();
                $(dummy).remove();
            }
            theWidth -= buttonsWidth;
            theWidth -= $input.outerWidth() - $input.width();
            $input.css("width", Math.floor(theWidth) + "px");
        } else {
            $input.css("width", "");
        }
    }
    return this;
};

EasySelector.prototype.setSettingOptions = function(settingOptions) {
    var i, option, selected = false;
    this.settingOptions = settingOptions;
    if(this.html) {
        $(this.dom.settingOptions).empty();
        for(i = 0; i < settingOptions.length; i+=1) {
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
    link.setAttribute("data-value", value);
    if(label || value) {
        link.appendChild(document.createTextNode(label));
        link.title = label || value;   
    } else {
        link.innerHTML = "&nbsp;";
    }
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
    var i, option;

    if(options.hasOwnProperty("length") && options.push) {
        if(this.html) {
            $(this.dom.list).empty();
        }
        if(useBackup) {
            if(this.html && this.listHtmlBackup) {
                for(i = 0; i < this.listHtmlBackup.childNodes.length; i+=1) {
                    option = this.listHtmlBackup.childNodes[i].cloneNode(true);
                    this.dom.list.appendChild(option);
                    if($(option).find("a").data("value") === this.getValue()) {
                        $(option).addClass("selected");
                    }
                }
            }
        } else {
            this.options = [];
            for(i = 0; i < options.length; i+=1) {
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
            for(i = 0; i < this.options.length; i+=1) {
                if(this.options[i].label.toLowerCase() === input || this.options[i].value.toLowerCase() === input) {
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
    var pos, $html = $(this.html), $panel = $(this.dom.settingsPanel);
    if(this.html && !this.isOpenSettings) {
        pos = $html.offset();
        $panel.css({
            top: pos.top + $html.outerHeight(),
            left: pos.left + $html.outerWidth() - $panel.outerWidth()
        }).show();
        this.isOpenSettings = true;
        $panel.find('a').eq(0).focus();
        this.close();
        if(typeof this.onSettingsPanelOpen === 'function') {
            this.onSettingsPanelOpen();
        }
    }
    return this;
};

EasySelector.prototype.open = function() {
    var pos;
    if(this.html && !this.isOpen) {
        this.closeSettings();
        this.dom.list.style.width = $(this.html).width() + "px";
        pos = $(this.html).offset();
        $(this.dom.list).css({
            top: pos.top + $(this.html).outerHeight(),
            left: pos.left
        }).show();
        $(this.html).addClass("expanded");
        this.isOpen = true;
        if(typeof this.onOptionsPanelOpen === 'function') {
            this.onOptionsPanelOpen();
        }
    }
    return this;
};

EasySelector.prototype.closeSettings = function() {
    if(this.html && this.isOpenSettings) {
        $(this.dom.settingsPanel).hide().removeClass('keyboard');
        this.isOpenSettings = false;
        if(typeof this.onSettingsPanelClose === 'function') {
            this.onSettingsPanelClose();
        }
    }
    return this;
};

EasySelector.prototype.close = function() {
    if(this.html && this.isOpen) {
        $(this.html).removeClass("expanded");
        $(this.dom.list).hide();
        this.isOpen = false;
        if(!this.existingValue) {
            this.processCurrentInput();
        }
        if(typeof this.onOptionsPanelClose === 'function') {
            this.onOptionsPanelClose();
        }
    }
    return this;
};

EasySelector.prototype.closeAndFocus = function() {
    if(this.html && this.isOpen) {
        $(this.close().getHTML()).focus();
    }
    return this;
};

EasySelector.prototype.setSelectedItem = function(label, value) {
    var prevValue = this.value;
    this.label = label;
    this.value = value;

    if(this.html) {
        this.dom.input.value = label;
    }
    this.existingValue = true;
    if(typeof this.onChange === 'function' && value !== prevValue && this.htmlCreationProcessFinished) {
        this.onChange(value, prevValue);
    }

    return this;
};

EasySelector.prototype.showSuggestions = function(text) {
    var i, textLength, msg, showing = 0, option;
    this.existingValue = false;
    if(this.html && typeof text === 'string') {
        if(text) {
            text = text.toLowerCase();
            textLength = text.length;
            $(this.dom.list).empty();
            for(i = 0; i < this.options.length; i+=1) {
                if(this.options[i].label.substr(0, textLength).toLowerCase() === text || this.options[i].value.substr(0, textLength).toLowerCase() === text) {
                    option = this.createHTMLOption(this.options[i].label, this.options[i].value);
                    if(this.options[i].value === this.getValue()) {
                        $(option).addClass("selected");
                    }
                    this.dom.list.appendChild(option);
                    showing += 1;
                }
            }
            if(!showing) {
                msg = document.createElement('li');
                msg.className = 'message';
                msg.appendChild(document.createTextNode(this.language.NO_SIMILAR_OPTIONS));
                this.dom.list.appendChild(msg);
            }
        } else {
            this.setOptions(this.options, true);
        }
        this.open();
    }
    return this;
};

EasySelector.prototype.listArrowKeysHandler = function() {
    var that = this;
    return function(e) {
        var list, closeFunction;
        e.stopPropagation();
        list = this;
        if(this === that.dom.list) {
            closeFunction = that.close;
        } else if(this === that.dom.settingsPanel) {
            closeFunction = that.closeSettings;
        } else {
            return;
        }

        if(e.keyCode === 38) {
            e.preventDefault();
            if($(list).hasClass('keyboard')) {
                $(e.target.parentElement).prev("li").find("a").focus();
            } else {
                $(list).find("li:last").find("a").focus();
            }
            $(list).addClass('keyboard');
        } else if(e.keyCode === 40) {  
            e.preventDefault();
            if($(list).hasClass('keyboard')) {
                $(e.target.parentElement).next("li").find("a").focus();
            } else {
                $(list).find("li:first").find("a").focus();
            }
            $(list).addClass('keyboard');
        } else if(e.keyCode === 27) {
            closeFunction();
            $(that.getHTML()).focus();
        } else if(e.keyCode === 9 && e.target === $(this).find('a:last').get(0)) {
            e.preventDefault();
        }
    };
};

EasySelector.prototype.attachListeners = function() {
    var that = this, clickEventInitiator = 'keyboard';
    $(this.html).on('keydown', function(e) {
        if(e.keyCode === 13) {
            $(that.dom.input).trigger('focus');
        }
    });
    $(this.dom.arrow).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if(that.isOpen) {
            that.closeAndFocus();
        } else {
            that.setOptions(that.options, true);
            that.open(); 
            $(that.dom.list).find("a").eq(0).focus();  
        }   
    }).on('keydown', function(e) {
        e.stopPropagation();
    });
    $(this.dom.settings).on('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        if($('.easyselector-settings:visible').length) {
            that.closeSettings();
        } else {
            that.openSettings();
        }
    }).on('keydown', function(e) {
        e.stopPropagation();
    });
    $(this.dom.settingsPanel).on('keydown', this.listArrowKeysHandler());

    $(this.dom.settingsPanel).on('click', 'a', function(e) {
        var prev = that.settingValue, pass = false;
        e.preventDefault();
        if(clickEventInitiator === 'mouse' || (clickEventInitiator === 'keyboard' && $(that.dom.settingsPanel).hasClass("keyboard"))) {
            pass = true;
        }

        if(pass) {
            that.settingValue = $(this).data("value");
            $(that.dom.settingsPanel).find("li.selected").removeClass("selected");
            $(this.parentElement).addClass("selected");
            if(typeof that.onSettingValueChange === 'function' && prev !== that.settingValue) {
                that.onSettingValueChange(that.getSettingValue(), prev);
            }
        }
        that.closeSettings();
        $(that.getHTML()).focus();
    }).on('mousedown', 'a', function() {
        clickEventInitiator = 'mouse';
    }).on('keydown', 'a', function() {
        clickEventInitiator = 'keyboard';
    });

    $(this.dom.input).on('keyup', function(e) {
        if(e.keyCode !== 13 && e.keyCode !== 27) {
            that.showSuggestions($.trim(this.value));
        }
    }).on('keydown', function(e) {
        e.stopPropagation();
        if(e.keyCode === 27) {
            that.setSelectedItem(that.label, that.getValue());
            that.closeAndFocus();
        } else if(e.keyCode === 13) {
            that.processCurrentInput();
            that.closeAndFocus();
        } else if(e.keyCode === 40) {
            $(that.dom.list).addClass('keyboard').find("a").eq(0).focus();
        }
    }).on('focus', function() {
        that.setOptions(that.options, true);
        that.open();
    });

    $(this.dom.list).on('click', 'a', function(e) {
        e.preventDefault();
        that.setSelectedItem(this.textContent, $(this).data("value"));
        that.closeAndFocus();
    }).on('keydown', this.listArrowKeysHandler());

    $(document).on('click focusin scroll', function(e) {
        if(!($(e.target).parents("#" + that.id).length || $(e.target).parents("#" + that.id + "-list").length || $(e.target).parents("#" + that.id + "-settings").length)) {
            that.closeSettings();
            that.close();
        }
    });
};

EasySelector.prototype.createHTML = function() {
    var container, input, arrow, settings, list, aux, settingsPanel;

    if(this.html) {
        return this.html;
    }

    container = document.createElement('div');
    container.className = 'easyselector';
    container.tabIndex = 0;

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
    settings.title = this.settingsButtonTooltip;
    aux = aux.cloneNode(true);
    settings.appendChild(aux);

    list = document.createElement('ul');
    list.className = 'easyselector-list';
    list.id = this.id + "-list";

    settingsPanel = document.createElement('ul');
    settingsPanel.className = 'easyselector-settings';
    settingsPanel.id = this.id + "-settings";

    container.appendChild(input);
    container.appendChild(settings);
    container.appendChild(arrow);
    document.body.appendChild(settingsPanel);
    document.body.appendChild(list);

    this.dom.input = input;
    this.dom.arrow = arrow;
    this.dom.settings = settings;
    this.dom.list = list;
    this.dom.settingsPanel = settingsPanel;

    container.id = this.id;
    this.html = container;

    this.setSettingsPanelWidth(this.settingsPanelWidth);
    this.setSettingOptions(this.settingOptions);
    this.setOptions(this.options);
    this.setListMaxHeight(this.listMaxHeight);
    this.setIsConfigurable(this.configurable);
    this.setSettingValue(this.settingValue);
    this.setSelectedItem(this.label, this.value);
    this.attachListeners();

    this.htmlCreationProcessFinished = true;

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
        cur;

    if(!this.settingOptions.length) {
        return this;
    }

    if(value === '[first]') {
        cur = $panel.find('li').eq(0).find('a');
        this.settingValue = this.settingOptions[0].value;
    } else if(value === '[last]'){
        cur = $panel.find('li:last').find('a');
        this.settingValue = this.settingOptions[this.settingOptions.length - 1].value;
    } else {
        cur = $panel.find("a[data-value="+value+"]");
        this.settingValue = value;
    }
    prev.removeClass("selected");
    cur.parent().addClass("selected");
    

    return this;
};

EasySelector.prototype.getSettingValue = function() {
    return this.settingValue || null;
};