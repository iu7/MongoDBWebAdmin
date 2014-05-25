$(document).ready(function() {
    var normalizeJSON = function(text) {
        return JSON.stringify(JSON.parse(text));
    };
    
    $(document).on({
        click: function() {
            $('#connect').nextAll().remove();
            $('#connect').attr('loading', 'true');
            $.get('/database-names', {
                server_address: $('#server-address').val()
            }).done(function(response) {
                $('#connect').removeAttr('loading');
                $('#connect').after(response);
            });
        }
    }, '#connect');
    
    $(document).on({
        click: function() {
            $('#open-database').nextAll().remove();
            $('#open-database').attr('loading', 'true');
            $.get('/collection-names', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val()
            }).done(function(response) {
                $('#open-database').removeAttr('loading');
                $('#open-database').after(response);
            });
        }
    }, '#open-database');
    
    $(document).on({
        click: function() {
            $('#open-collection').nextAll().remove();
            $('#open-collection').attr('loading', 'true');
            $.get('/object-ids', {
                server_address: $('#server-address').val(),
                database_name: $('#database-name').val(),
                login: $('#login').val(),
                password: $('#password').val(),
                selector: normalizeJSON($('#selector').text()),
                projector: normalizeJSON($('#projector').text())
            }).done(function(response) {
                $('#open-collection').removeAttr('loading');
                $('#open-collection').after(response);
            });
        }
    }, '#open-collection');
});
