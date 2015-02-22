$(document).ready(function() {
    /* Add a [>>>] button on the top-right corner of code samples to hide
     * the >>> and ... prompts and the output and thus make the code
     * copyable. */
    var code = $('.highlight .hljs')

    // get the styles from the current theme
    code.parent().css('position', 'relative');
    var hide_text = 'Hide the prompts and output';
    var show_text = 'Show the prompts and output';
    var button_styles = {
        'cursor':'pointer', 'position': 'absolute', 'top': '9px', 'right': '10px',
        'border-color': 'rgb(170,170,170)', 'border-style': 'solid',
        'border-width':'1px', 'color': 'rgb(90,90,90)', 'text-size': '85%',
        'font-family': 'monospace', 'padding-left': '0.3em', 'padding-right': '0.3em',
    }

    // create and add the button to all the code blocks that contain >>>
    code.each(function(index) {
        var $jthis = $(this);
        if ($jthis.find('.hljs-prompt').length > 0) {
            var $button = $('<span class="copybutton"><b>&gt;&gt;&gt;</b></span>');
            $button.css(button_styles)
            $button.attr('title', hide_text);
            $jthis.prepend($button);
            $button.show();

            $jthis.attr("title", "Click >>> on the top-right to hide prompts");

            $output = $jthis.find('.hljs-string').filter(function() {
                                return this.innerHTML.indexOf("'''")==0;});
            $output.each(function(index) {
                var $jthis = $(this);
                var txt = $jthis.html();
                $jthis.html(txt.substring(3, txt.length-3));
                $jthis.addClass('hljs-output');
                $jthis.removeClass('hljs-string');
            });
        }
    });

    $('.copybutton').click(
            function() {
                var $button = $(this);
                if ($button.hasClass('prompt-hidden')) {
                    $button.parent().find('.hljs-prompt').show();
                    $button.parent().find('.hljs-output').show();
                    $button.css('text-decoration', 'none');
                    $button.attr('title', hide_text);
                } else {
                    $button.parent().find('.hljs-prompt').hide();
                    $button.parent().find('.hljs-output').hide();
                    $button.css('text-decoration', 'line-through');
                    $button.attr('title', show_text);
                }
                $button.toggleClass('prompt-hidden');
            });
});

