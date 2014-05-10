$(document).ready(function() {
    var deletePairOrItem = function(database_name, collection_name, document_id, pair_or_item) {
        pair_or_item.remove();
    };
    
    var deleteDocument = function(database_name, collection_name, document) {
        document.remove();
    };
    
    var deleteCollection = function(database_name, collection) {
        collection.remove();
    };
    
    var deleteDatabase = function(database) {
        database.remove();
    };
    
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
            document.children('.content-faker').remove();
            object = $(object).replaceAll(document.children('.content-placeholder'));
            object.find('.controls').children('.delete').on('click', function() {
                var pair_or_item = $(this).closest('.pair, .item');
                deletePairOrItem(database_name, collection_name, document_id, pair_or_item);
            });
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
            documents = $(documents).replaceAll(collection.children('.content-placeholder'));
            documents.children('.toggler').on('click', function() {
                var document = $(this).parent();
                loadDocument(database_name, collection_name, document);
            });
            documents.children('.controls').children('.delete').on('click', function() {
                var document = $(this).closest('.document');
                deleteDocument(database_name, collection_name, document);
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
            collections = $(collections).replaceAll(database.children('.content-placeholder'));
            collections.children('.toggler').on('click', function() {
                var collection = $(this).parent();
                loadCollection(database_name, collection);
            });
            collections.children('.controls').children('.delete').on('click', function() {
                var collection = $(this).closest('.collection');
                deleteCollection(database_name, collection);
            });
            database.children('.toggler').off('click').on('click', function() {
                toggleRollable(database);
            });
            database.attr('status', 'unrolled');
        });
    };
    
    var loadRoot = function() {
        $.get('/load', function(databases) {
            databases = $(databases).replaceAll($('#root').children('.content-placeholder'))
            databases.children('.toggler').on('click', function() {
                var database = $(this).parent();
                loadDatabase(database);
            });
            databases.children('.controls').children('.delete').on('click', function() {
                var database = $(this).closest('.database');
                deleteDatabase(database);
            });
        });
    };
    
    loadRoot();
});
