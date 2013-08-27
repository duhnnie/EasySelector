var easySelector;

function init() {
    easySelector = new EasySelector({
        options: [
            {
                label: "abc",
                value: "opt 1"
            },
            {
                label: "abcdef",
                value: "opt 2"
            },
            {
                label: "abcedfghi",
                value: "opt 3"
            },
            {
                label: "abcdefghij",
                value: "opt 4"
            },
            {
                label: "abcdefghijk",
                value: "opt 5"
            }
        ],
        settingOptions: [
            {
                label: "set",
                value: "set"
            }, {
                label: "array",
                value: "array"
            }, {
                label: "concat",
                value: "concat"
            }
        ],
        settingValue: 'array',
        width: '100%',
        configurable: true,
        onSettingsPanelOpen: function() {
            console.log(this, "open settings");
        },
        onSettingsPanelClose: function() {
            console.log(this, "close settings");
        },
        onOptionsPanelOpen: function() {
            console.log(this, "open options");
        },
        onOptionsPanelClose: function() {
            console.log(this, "close options");
        }
    });
    $('#cont').append(easySelector.getHTML());
}

$(init);