$(document).ready(function() {
    $(document).on({
        click: function() {
            var database = $(this).closest('.database');
            var collection = $(this).closest('.collection');
            var document = $(this).closest('.document');
            var database_name = database.children('.name').html();
            var collection_name = collection.children('.name').html();
            var document_id = document.children('.id').html();
            document.attr('status', 'loading');
            $.get('/load/' + database_name + '/' + collection_name + '/' + document_id, function(object) {
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
            collection.attr('status', 'loading');
            $.get('/load/' + database_name + '/' + collection_name, function(documents) {
                collection.children('.content-placeholder').replaceWith(documents);
                collection.attr('status', 'unrolled');
            });
        }
    }, '.collection[status="unloaded"] > .toggler');
    
    $(document).on({
        click: function() {
            var database = $(this).closest('.database');
            var database_name = database.children('.name').html();
            database.attr('status', 'loading');
            $.get('/load/' + database_name, function(collections) {
                database.children('.content-placeholder').replaceWith(collections);
                database.attr('status', 'unrolled');
            });
        }
    }, '.database[status="unloaded"] > .toggler');
    
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
    
    $.get('/load', function(databases) {
        $('#root').children('.content-placeholder').replaceWith(databases);
    });
});
