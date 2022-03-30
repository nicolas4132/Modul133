$(document).ready(function() {

    var beruf_id = localStorage.getItem('berufs_id');

    if (beruf_id != '' && beruf_id != null) {
        apiClassCall(beruf_id)
    }

    $.ajax({
        type: "GET",
        url: "http://sandbox.gibm.ch/berufe.php",
        data: { format: 'JSON' },
        dataType: 'json'
    }).done(function(data) {
        $('#jobSelector').append('<option>Ihre Auswahl ... </option>');
        $.each(data, function(key, value) {
            console.log(value)
            if (value.beruf_id == localStorage.getItem('beruf_id')) {
                $('#jobSelector').append('<option value=' + value.beruf_id + 'selected>' + value.beruf_name + '</option>')
            } else {
                $('#jobSelector').append('<option value=' + value.beruf_id + '>' + value.beruf_name + '</option>')
            }
        })
    }).fail(function() {
        $('#errorMessage').text("Fehler aufgetreten");
    })


    $('#jobSelector').change(function(e) {
        localStorage.setItem('beruf_id', this.value);
        apiClassCall(this.value);
    })

})