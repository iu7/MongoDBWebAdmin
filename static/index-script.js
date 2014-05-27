$(document).ready(function() {
    $(document).on({
        click: function() {
            $('#connect').closest('.load-anchor').nextAll().remove();
            $('#connect').attr('loading', 'true');
            $.post('/database-names', {
                server_address: $('#server-address').val()
            }).done(function(response) {
                $('#connect').removeAttr('loading');
                $('#connect').closest('.load-anchor').after(response);
            });
        }
    }, '#connect');
    
    $(document).on({
        click: function() {
            $('#open-database').closest('.load-anchor').nextAll().remove();
            $('#open-database').attr('loading', 'true');
            $.post('/collection-names', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val()
            }).done(function(response) {
                $('#open-database').removeAttr('loading');
                $('#open-database').closest('.load-anchor').after(response);
            });
        }
    }, '#open-database');
    
    $(document).on({
        click: function() {
            $('#open-collection').closest('.load-anchor').nextAll().remove();
            $('#open-collection').attr('loading', 'true');
            $.post('/documents', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                collection_name: $('#collection-name').val(),
                selector: $('#selector').text(),
                projector: $('#projector').text()
            }).done(function(response) {
                $('#open-collection').removeAttr('loading');
                $('#open-collection').closest('.load-anchor').after(response);
            });
        }
    }, '#open-collection');
});
