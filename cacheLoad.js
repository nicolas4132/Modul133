$(document).ready(function() {
    var activeWeekNumber = moment().format("WW");
    var activeYear = moment().format("GGGG");

    var beruf_id = localStorage.getItem('beruf_id');
    var klasse_id = localStorage.getItem('klasse_id');

    console.log(beruf_id)

    if (beruf_id != '' && beruf_id != null) {
        apiClassCall(beruf_id)
        if (klasse_id != '' && klasse_id != null) {
            tableFill(klasse_id);
        }
    }

    $('#classSelector').change(function(e) {
        localStorage.setItem('klasse_id', this.value);
        $('#tableOutput').empty();
        tableFill(this.value);
    })

    $('#jobSelector').change(function(e) {
        localStorage.setItem('beruf_id', this.value);
        $('#classSelector').empty();
        $('#tableOutput').empty();
        $('#week').empty();
        apiClassCall(this.value);
    })

    $('#lastWeek').click(function(e) {

        if (activeWeekNumber == 1) {
            activeWeekNumber = 53;
            activeYear--;
        }

        activeWeekNumber--;

        localStorage.setItem('week', `${activeWeekNumber}-${activeYear}`);

        UpdateWeekSelector();
    })

    $('#nextWeek').click(function(e) {
        if (activeWeekNumber == 52) {
            activeWeekNumber = 0;
            activeYear++;
        }

        activeWeekNumber++;

        localStorage.setItem('week', `${activeWeekNumber}-${activeYear}`);

        UpdateWeekSelector();
    })

    function UpdateWeekSelector() {
        document.getElementById('week').innerHTML = "Woche " + localStorage.getItem('week');
    }

    $.ajax({
        type: "GET",
        url: "http://sandbox.gibm.ch/berufe.php",
        data: { format: 'JSON' },
        dataType: 'json'
    }).done(function(data) {
        $('#jobSelector').append('<option>Ihre Auswahl ... </option>');
        $.each(data, function(key, value) {
            if (value.beruf_id == localStorage.getItem('beruf_id')) {
                $('#jobSelector').append('<option value="' + value.beruf_id + '" selected>' + value.beruf_name + '</option>')
            } else {
                $('#jobSelector').append('<option value=' + value.beruf_id + '>' + value.beruf_name + '</option>')
            }
        })
    }).fail(function() {
        $('#errorMessage').text("Fehler aufgetreten");
    })

    function apiClassCall(beruf_id) {
        console.log(beruf_id)
        $.ajax({
            type: "GET",
            url: "http://sandbox.gibm.ch/klassen.php?beruf_id=" + beruf_id,
            data: { format: 'JSON' },
            dataType: 'json'
        }).done(function(data) {
            $('#classSelector').append('<option>Ihre Auswahl ... </option>');
            $.each(data, function(key, value) {
                console.log(value)
                if (value.klasse_id == localStorage.getItem('klasse_id')) {
                    console.log("hallo")
                    $('#classSelector').append('<option value="' + value.klasse_id + '" selected>' + value.klasse_longname + '</option>')
                } else {
                    $('#classSelector').append('<option value=' + value.klasse_id + '>' + value.klasse_longname + '</option>')
                }
            })
        }).fail(function() {
            $('#errorMessage').text("Fehler aufgetreten");
        })
    }

    function getDayNameByNumber(number) {
        var day = parseInt(number);
        switch (day) {
            case 1:
                return "Montag";
            case 2:
                return "Dienstag";
            case 3:
                return "Mittwoch";
            case 4:
                return "Donnerstag";
            case 5:
                return "Freitag";
            case 6:
                return "Samstag";
            case 7:
                return "Sonntag";
            default:
                return "undefined";
        }
    }

    function tableFill(klasse_id) {
        $.ajax({
            type: "GET",
            url: "http://sandbox.gibm.ch/tafel.php?klasse_id=" + klasse_id,
            data: { format: 'json' },
            dataType: 'json'
        }).done(function(data) {
            if (data != '' && data != null) {
                $('#tableOutput').append('<table class="table"><tr><td><b>Datum</b></td><td><b>Wochentag</b></td><td><b>von</b></td><td><b>Bis</b></td><td><b>Lehrer</b></td><td><b>Fach</b></td><td><b>Raum</b></td></tr>');
                $.each(data, function(key, value) {
                    $('#tableOutput table').append('<tr><td>' + value.tafel_datum +
                        '</td><td>' + getDayNameByNumber(value.tafel_wochentag) +
                        '</td><td>' + value.tafel_von +
                        '</td><td>' + value.tafel_bis +
                        '</td><td>' + value.tafel_lehrer +
                        '</td><td>' + value.tafel_longfach +
                        '</td><td>' + value.tafel_raum +
                        '</td></tr>');
                })
                $('#week').append("Woche " + moment().format("WW-GGGG"));
                localStorage.setItem('week', moment().format("WW-GGGG"));
            } else {
                $('#tableOutput').html('<div class="alert alert-warning">Fehler...</div>');
            }
        }).fail(function() {
            $('#tableOutput').html('<div class="alert alert-danger">Fehler ... </div>');
        })
    }

})