$(document).ready(function() {

    var activeWeekNumber = moment().format("WW");
    var activeYear = moment().format("GGGG");

    var beruf_id = localStorage.getItem('beruf_id');
    var klasse_id = localStorage.getItem('klasse_id');

    if (beruf_id != '' && beruf_id != null) {
        apiClassCall(beruf_id)
        $('#classTitle').show();
        $('#classSelector').show();
        if (klasse_id != '' && klasse_id != null) {
            tableFill(klasse_id);
            $('#lastWeek').show();
            $('#nextWeek').show();
        } else {
            $('#lastWeek').hide();
            $('#nextWeek').hide();
            $('#messageBox').hide();
        }
    } else {
        $('#classSelector').append('<option>Wählen sie eine Berufsgruppe ... </option>');
        $('#lastWeek').hide();
        $('#nextWeek').hide();
        $('#classTitle').hide();
        $('#classSelector').hide();
        $('#messageBox').hide();
    }

    $('#classSelector').change(function(e) {
        localStorage.setItem('klasse_id', this.value);
        $('#tableOutput').empty();
        $('#week').empty();
        $('#messageBox').hide();
        tableFill(this.value);
    })

    $('#jobSelector').change(function(e) {
        localStorage.setItem('beruf_id', this.value);
        $('#classSelector').empty();
        $('#tableOutput').empty();
        $('#week').empty();
        $('#lastWeek').hide();
        $('#nextWeek').hide();
        $('#messageBox').hide();
        $('#classTitle').show();
        $('#classSelector').show();
        apiClassCall(this.value);
    })

    $('#lastWeek').click(function(e) {

        if (activeWeekNumber == 1) {
            activeWeekNumber = 53;
            activeYear--;
        }

        activeWeekNumber--;

        localStorage.setItem('week', `${activeWeekNumber}-${activeYear}`);
        localStorage.setItem("weekNumb", activeWeekNumber);
        localStorage.setItem("year", activeYear);

        updateWeekSelector();
        updateTabeloutput(localStorage.getItem('week'));
        $('#tableOutput').empty();
    });

    $('#nextWeek').click(function(e) {
        if (activeWeekNumber == 52) {
            activeWeekNumber = 0;
            activeYear++;
        }

        activeWeekNumber++;

        localStorage.setItem('week', `${activeWeekNumber}-${activeYear}`);
        localStorage.setItem("weekNumb", activeWeekNumber);
        localStorage.setItem("year", activeYear);

        updateWeekSelector();
        updateTabeloutput(localStorage.getItem('week'));
        $('#tableOutput').empty();
    });

    function updateWeekSelector() {
        $('#messageBox').empty();
        document.getElementById('week').innerHTML = "Woche " + localStorage.getItem('week');
        $('#messageBox').append('<div class="alert alert-success">Neue Woche geladen! Woche: ' + localStorage.getItem('week') + ' </div>');
    }

    function updateTabeloutput(week) {
        $.ajax({
            type: "GET",
            url: "http://sandbox.gibm.ch/tafel.php?klasse_id=" + localStorage.getItem('klasse_id') + "& woche=" + week,
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
            } else {
                $('#tableOutput').html('<div class="alert alert-warning">Keine Daten vorhanden!</div>');
            }
        }).fail(function() {
            $('#tableOutput').html('<div class="alert alert-danger">Fehler ... </div>');
        })
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
    });

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
                $('#lastWeek').show();
                $('#nextWeek').show();
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