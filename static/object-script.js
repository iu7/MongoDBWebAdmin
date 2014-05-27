$(document).ready(function() {
    var isEmptySet = function(jSet) {
        return jSet.length == 0; 
    };
    
    (function() {
        var isJSON = function(text) {
            try {
                $.parseJSON(text);
                return true;
            } catch (exception) {
                return false;
            }
        };
        
        var isJSONString = function(text) {
            return isJSON(text) && text[0] == '"';
        };
        
        var makeEvents = function(isValid) {
            return {
                blur: function(event) {
                    var editable = $(this);
                    var content = editable.text().trim();
                    if (isValid(content)) {
                        $.post('/render-object', {json: content}, function(object) {
                            var object = $(object);
                            editable.replaceWith(object);
                        });
                    }
                },
                keydown: function(event) {
                    var ENTER = 13;
                    var ESC = 27;
                    if (event.which == ENTER || event.which == ESC) {
                        $(this).blur();
                    }
                },
                keyup: function(event) {
                    var content = $(this).text().trim();
                    if (isValid(content)) {
                        $(this).removeAttr('invalid');
                    } else {
                        $(this).attr('invalid', true);
                    }
                }
            };
        };
        
        $(document).on(makeEvents(isJSONString), '.key > .editable');
        $(document).on(makeEvents(isJSON), ':not(.key) > .editable');
    })();
   
    $(document).on({
        click: function() {
            var inserter = $(this);
            var insert_anchor = inserter.closest('.insert-anchor');
            var last = isEmptySet(insert_anchor.next('.insert-anchor'));
            var what = inserter.attr('what');
            $.post('/render-empty-' + what, {last: last}, function(empty_pair) {
                if (last) {
                    insert_anchor.children('.value').after('<span class="separator">,</span>')
                }
                insert_anchor.after(empty_pair);
            });
        }
    }, '.inserter');
   
    $(document).on({
        click: function() {
            var deleter = $(this);
            var deletable = $(this).closest('.deletable');
            var previous_deletable = deletable.prev('.deletable');
            var last = isEmptySet(deletable.next('.deletable'));
            deletable.remove();
            if (last) {
                previous_deletable.children('.separator').remove();
            }
        }
    }, '.deleter');
   
    $(document).on({
        click: function() {
            var rollable = $(this).closest('.rollable');
            rollable.attr('status', 'rolledup');
        }
    }, '.rollable[status="unrolled"] > .toggler');
    $(document).on({
        click: function() {
            var rollable = $(this).closest('.rollable');
            rollable.attr('status', 'unrolled');
        }
    }, '.rollable[status="rolledup"] > .toggler');
});


