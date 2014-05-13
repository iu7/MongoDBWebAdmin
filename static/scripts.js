$(document).ready(function() {
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
        dblclick: function() {
            $(this).attr('contentEditable', true);
            $(this).focus();
        }
    }, '.editable');
    $(document).on({
        focusout: function() {
            $(this).attr('contentEditable', false);
        },
        keydown: function(event) {
            var ENTER = 13;
            var ESC = 27;
            if (event.which == ENTER || event.which == ESC) {
                $(this).attr('contentEditable', false);
                $(this).blur();
            }
        }
    }, '.editable');
    
    $(document).on({
        click: function() {
            var database = $(this).closest('.database');
            var collection = $(this).closest('.collection');
            var document = $(this).closest('.document');
            var database_name = database.children('.name').html();
            var collection_name = collection.children('.name').html();
            var document_id = document.children('.id').html();
            var request = {
                database_name: database_name,
                collection_name: collection_name,
                document_id: document_id
            };
            document.attr('status', 'loading');
            $.get('/load/document', request, function(object) {
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
            var database_name = database.children('.name').html();
            var collection_name = collection.children('.name').html();
            var request = {
                database_name: database_name,
                collection_name: collection_name
            };
            collection.attr('status', 'loading');
            $.get('/load/collection', request, function(documents) {
                collection.children('.content-placeholder').replaceWith(documents);
                collection.attr('status', 'unrolled');
            });
        }
    }, '.collection[status="unloaded"] > .toggler');
    
    $(document).on({
        click: function() {
            var database = $(this).closest('.database');
            var database_name = database.children('.name').html();
            var request = {
                database_name: database_name
            };
            database.attr('status', 'loading');
            $.get('/load/database', request, function(collections) {
                database.children('.content-placeholder').replaceWith(collections);
                database.attr('status', 'unrolled');
            });
        }
    }, '.database[status="unloaded"] > .toggler');
    

    $.get('/load/root', function(databases) {
        $('#root').children('.content-placeholder').replaceWith(databases);
    });
});
