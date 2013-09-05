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
                label: "",
                value: ""
            },
            {
                label: "set eweqr ewqrrw r rqewr wafaqwer ewreqwr qwer qwer qwer qw erqwer qwer",
                value: "set"
            }, {
                label: "array",
                value: "array"
            }, {
                label: "concat",
                value: "concat"
            }
        ],
        settingValue: '',
        settingsPanelWidth: 400,
        width: '100%',
        configurable: true,
        settingsButtonTooltip: 'my settings',
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