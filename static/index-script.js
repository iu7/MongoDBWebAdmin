$(document).ready(function() {
    $(document).on({
        click: function() {
            $('#connect').closest('.load-anchor').nextAll().remove();
            $.post('/connect', {
                server_address: $('#server-address').val()
            }).done(function(response) {
                $('#connect').closest('.load-anchor').after(response);
            });
        }
    }, '#connect');

    $(document).on({
        click: function() {
            $('#database-stats').contents().remove();
            $('#execute-command').closest('.load-anchor').nextAll().remove();
            $.post('/execute-command', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val()
            }).done(function(response) {
                $('#execute-command').closest('.load-anchor').after(response);
            });
        }
    }, '#execute-command');
    
    $(document).on({
        click: function() {
            $('#execute').closest('.load-anchor').nextAll().remove();
            $.post('/execute', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                command: $('#command').text()
            }).done(function(response) {
                $('#execute').closest('.load-anchor').after(response);
            });
        }
    }, '#execute');

    $(document).on({
        click: function() {
            $('#database-stats').contents().remove();
            $('#open-database').closest('.load-anchor').nextAll().remove();
            $.post('/open-database', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val()
            }).done(function(response) {
                response = $(response);
                $('#database-stats').append(response.filter('#database-stats').contents());
                $('#open-database').closest('.load-anchor').after(response.filter(':not(#database-stats)'));
            });
        }
    }, '#open-database');
    
    $(document).on({
        click: function() {
            $('#collection-stats').contents().remove();
            $('#open-collection').closest('.load-anchor').nextAll().remove();
            $.post('/open-collection', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                collection_name: $('#collection-name').val()
            }).done(function(response) {
                response = $(response);
                $('#collection-stats').append(response.filter('#collection-stats').contents());
                $('#open-collection').closest('.load-anchor').after(response.filter(':not(#collection-stats)'));
            });
        }
    }, '#open-collection');
    
    $(document).on({
        click: function() {
            $('#find-documents').closest('.load-anchor').nextAll().remove();
            $.post('/find-documents', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                collection_name: $('#collection-name').val(),
                selector: $('#selector').text(),
                projector: $('#projector').text()
            }).done(function(response) {
                $('#find-documents').closest('.load-anchor').after(response);
            });
        }
    }, '#find-documents');
    
    $(document).on({
        click: function() {
            $('#find-documents').closest('.load-anchor').nextAll().remove();
            $.post('/new-document', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                collection_name: $('#collection-name').val()
            }).done(function(response) {
                $('#find-documents').closest('.load-anchor').after(response);
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
