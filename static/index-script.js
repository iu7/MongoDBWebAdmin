$(document).ready(function() {
    $(document).on({
        click: function() {
            $('#connect').closest('.load-anchor').nextAll().remove();
            $.post('/database-names', {
                server_address: $('#server-address').val()
            }).done(function(response) {
                $('#connect').closest('.load-anchor').after(response);
            });
        }
    }, '#connect');
    
    $(document).on({
        click: function() {
            $('#open-database').closest('.load-anchor').nextAll().remove();
            $.post('/collection-names', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val()
            }).done(function(response) {
                $('#open-database').closest('.load-anchor').after(response);
            });
        }
    }, '#open-database');
    
    $(document).on({
        click: function() {
            $('#open-collection').closest('.load-anchor').nextAll().remove();
            $.post('/documents', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                collection_name: $('#collection-name').val(),
                selector: $('#selector').text(),
                projector: $('#projector').text()
            }).done(function(response) {
                $('#open-collection').closest('.load-anchor').after(response);
            });
        }
    }, '#open-collection');
    
    $(document).on({
        click: function() {
            $('#new-document').nextAll().remove();
            $.post('/new-document', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                collection_name: $('#collection-name').val(),
            }).done(function(response) {
                response = $(response)
                if (response.hasClass('.error-message')) {
                    $('#new-document').after(response);
                } else {
                    $('#new-document-anchor').after(response)
                }
            });
        }
    }, '#new-document');
    
    $(document).on({
        click: function() {
            var document = $(this).closest('.document');
            document.children('.object').nextAll().remove();
            $.post('/update-document', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                collection_name: $('#collection-name').val(),
                document_id: document.attr('document_id'),
                document_text: document.text()
            }).done(function(response) {
                response = $(response);
                if (response.hasClass('error-message')) {
                    document.children('.object').after(response);
                }
            });
        }
    }, '.document-updater');
    
    $(document).on({
        click: function() {
            var document = $(this).closest('.document');
            document.children('.object').nextAll().remove();
            $.post('/reload-document', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                collection_name: $('#collection-name').val(),
                projector: $('#projector').text(),
                document_id: document.attr('document_id')
            }).done(function(response) {
                response = $(response)
                if (response.hasClass('.error-message')) {
                    document.children('.object').after(response);
                } else if (response.hasClass('object')) {
                    document.children('.object').replaceWith(response);
                }
            });
        }
    }, '.document-reloader');
    
    $(document).on({
        click: function() {
            var document = $(this).closest('.document');
            document.children('.object').nextAll().remove();
            $.post('/delete-document', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                collection_name: $('#collection-name').val(),
                document_id: document.attr('document_id')
            }).done(function(response) {
                response = $(response)
                if (response.hasClass('.error-message')) {
                    document.children('.object').after(response);
                } else {
                    document.prev('.nice-line').remove()
                    document.remove();
                }
            });
        }
    }, '.document-deleter');
});
