$(document).ready(function() {
    var objectTemplate = nunjucks.compile($('#object_template').html());
    var documentsTemplate = nunjucks.compile($('#documents_template').html());
    var collectionsTemplate = nunjucks.compile($('#collections_template').html());
    var databasesTemplate = nunjucks.compile($('#databases_template').html());
    
    var loadObject = function(database_name, collection_name, document) {
        var status = document.attr('status');
        if (status == 'unrolled') {
            document.attr('status', 'rolledup');
        } else if (status == 'rolledup') {
            document.attr('status', 'unrolled');
        } else if (status == 'unloaded') {
            var document_id = document.children('.id').html();
            document.attr('status', 'loading');
            $.getJSON('/get_object', {database_name: database_name,
                                      collection_name : collection_name,
                                      document_id : document_id}, function(object) {
                var isa = function(object, type) {
                    return type == 'null' && object == null ||
                           type == 'boolean' && typeof object == 'boolean' ||
                           type == 'number' && typeof object == 'number' ||
                           type == 'string' && typeof object == 'string' ||
                           type == 'array' && object instanceof Array ||
                           type == 'object';
                };
                function render(object) {
                    return objectTemplate.render({object: object, isa : isa, recurse : render});
                }
                document.append(render(object));
                document.attr('status', 'unrolled');
                document.find('.rollable > .header').click(function() {
                    var object = $(this).parent();
                    var status = object.attr('status');
                    if (status == 'unrolled') {
                        object.attr('status', 'rolledup');
                    } else if (status == 'rolledup') {
                        object.attr('status', 'unrolled');
                    }
                });
            });
        }
    };
    
    var loadDocuments = function(database_name, collection) {
        var status = collection.attr('status');
        if (status == 'unrolled') {
            collection.attr('status', 'rolledup');
        } else if (status == 'rolledup') {
            collection.attr('status', 'unrolled');
        } else if (status == 'unloaded') {
            var collection_name = collection.children('.name').html();
            collection.attr('status', 'loading');
            $.getJSON('/get_document_ids', {database_name: database_name,
                                            collection_name : collection_name}, function(document_ids) {
                collection.append(documentsTemplate.render({ids: document_ids}));
                collection.attr('status', 'unrolled');
                collection.find('.document > .id').click(function() {
                    var document = $(this).parent();
                    loadObject(database_name, collection_name, document);
                });
            });
        }
    }
    
    var loadCollections = function(database) {
        var status = database.attr('status');
        if (status == 'unrolled') {
            database.attr('status', 'rolledup');
        } else if (status == 'rolledup') {
            database.attr('status', 'unrolled');
        } else if (status == 'unloaded') {
            var database_name = database.children('.name').html();
            database.attr('status', 'loading'); 
            $.getJSON('/get_collection_names', {database_name: database_name}, function(collection_names) {
                database.append(collectionsTemplate.render({names: collection_names}));
                database.attr('status', 'unrolled');
                database.find('.collection > .name').click(function() {
                    var collection = $(this).parent();
                    loadDocuments(database_name, collection);
                });
            });
        }
    };
    
    var loadDatabases = function() {
        $.getJSON('/get_database_names', {}, function(database_names) {
            $('#content').append(databasesTemplate.render({names: database_names}));
            $('.database > .name').click(function() {
                var database = $(this).parent();
                loadCollections(database);
            });
        });
    };
    
    
    loadDatabases();
});
