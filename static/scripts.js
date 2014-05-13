$(document).ready(function() {
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
                    var content = editable.text();
                    if (isValid(content)) {
                        $.get('/render-object', {json: content}, function(object) {
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
                    var content = $(this).text();
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
            var deletable = $(this).closest('.deletable');
            deletable.remove();
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
    
    $(document).on({
        click: function() {
            var database = $(this).closest('.database');
            var collection = $(this).closest('.collection');
            var document = $(this).closest('.document');
            var database_name = database.children('.name').text();
            var collection_name = collection.children('.name').text();
            var document_id = document.children('.id').text();
            var request = {
                database_name: database_name,
                collection_name: collection_name,
                document_id: document_id
            };
            document.attr('status', 'loading');
            $.get('/load-document', request, function(object) {
                var object = $(object);
                document.removeClass('rollable');
                document.children('.content-faker').remove();
                document.children('.content-placeholder').replaceWith(object);
                
                
                
                document.attr('status', 'unrolled');
            });
        }
    }, '.document[status="unloaded"] > .toggler');
    
    $(document).on({
        click: function() {
            var database = $(this).closest('.database');
            var collection = $(this).closest('.collection');
            var database_name = database.children('.name').text();
            var collection_name = collection.children('.name').text();
            var request = {
                database_name: database_name,
                collection_name: collection_name
            };
            collection.attr('status', 'loading');
            $.get('/load-collection', request, function(documents) {
                collection.children('.content-placeholder').replaceWith(documents);
                collection.attr('status', 'unrolled');
            });
        }
    }, '.collection[status="unloaded"] > .toggler');
    
    $(document).on({
        click: function() {
            var database = $(this).closest('.database');
            var database_name = database.children('.name').text();
            var request = {
                database_name: database_name
            };
            database.attr('status', 'loading');
            $.get('/load-database', request, function(collections) {
                database.children('.content-placeholder').replaceWith(collections);
                database.attr('status', 'unrolled');
            });
        }
    }, '.database[status="unloaded"] > .toggler');
    
    $.get('/load-root', function(databases) {
        $('#root').children('.content-placeholder').replaceWith(databases);
    });
});
