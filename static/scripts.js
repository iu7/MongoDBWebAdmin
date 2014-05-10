$(document).ready(function() {
    var toggleRollable = function(rollable) {
        var status = rollable.attr('status');
        if (status == 'unrolled') {
            rollable.attr('status', 'rolledup');
        } else if (status == 'rolledup') {
            rollable.attr('status', 'unrolled');
        }
    }
    
    var loadDocument = function(database_name, collection_name, document) {
        var document_id = document.children('.id').html();
        document.attr('status', 'loading');
        $.get('/load/' + database_name + '/' + collection_name + '/' + document_id, function(object) {
            document.removeClass('rollable');
            document.children(':not(.id):not(.content-placeholder)').remove();
            $(object).replaceAll(document.children('.content-placeholder'));
            document.find('.toggler').on('click', function() {
                var object_or_array = $(this).parent();
                toggleRollable(object_or_array);
            });
            document.attr('status', 'unrolled');
        });
    };
    
    var loadCollection = function(database_name, collection) {
        var collection_name = collection.children('.name').html();
        collection.attr('status', 'loading');
        $.get('/load/' + database_name + '/' + collection_name, function(documents) {
            $(documents).replaceAll(collection.children('.content-placeholder'))
            .children('.toggler').on('click', function() {
                var document = $(this).parent();
                loadDocument(database_name, collection_name, document);
            });
            collection.children('.toggler').off('click').on('click', function() {
                toggleRollable(collection);
            });
            collection.attr('status', 'unrolled');
        });
    }

    var loadDatabase = function(database) {
        var database_name = database.children('.name').html();
        database.attr('status', 'loading');
        $.get('/load/' + database_name, function(collections) {
            $(collections).replaceAll(database.children('.content-placeholder'))
            .children('.toggler').on('click', function() {
                var collection = $(this).parent();
                loadCollection(database_name, collection);
            });
            database.children('.toggler').off('click').on('click', function() {
                toggleRollable(database);
            });
            database.attr('status', 'unrolled');
        });
    };
    
    var loadRoot = function() {
        $.get('/load', function(databases) {
            $(databases).replaceAll($('#root').children('.content-placeholder'))
            .children('.toggler').on('click', function() {
                var database = $(this).parent();
                loadDatabase(database);
            });
        });
    };
    
    loadRoot();
});
