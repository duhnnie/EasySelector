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
        ]
    });
    $(document.body).prepend(easySelector.getHTML());
}

$(init);