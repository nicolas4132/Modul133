//Wenn der DOM ready ist
$(document).ready(function() {

    //Aktuelle Kalenderwoche aus der moment Libary in Variabel speichern
    var activeWeekNumber = moment().format("WW");
    //Aktuelles Jahr aus der moment Libary in Variabel speichern
    var activeYear = moment().format("GGGG");

    //Beruf und Klassen ID aus dem LocalStorage laden
    var beruf_id = localStorage.getItem('beruf_id');
    var klasse_id = localStorage.getItem('klasse_id');

    //überprüfen ob Beruf ID ungleich leer oder null ist
    if (beruf_id != '' && beruf_id != null) {
        //Methodenaufruf und beruf id mitgeben
        apiClassCall(beruf_id)
            //den Klassentitel und Selector anzeigen
        $('#classTitle').show();
        $('#classSelector').show();
        //überprüfen ob Klasse ID ungleich leer oder null ist
        if (klasse_id != '' && klasse_id != null) {
            //Methodenaufruf und klassen id mitgeben
            tableFill(klasse_id);
        } else {
            //falls zweites if nicht zutrifft die Wochen-Buttons nicht anzeigen und die MessageBox
            $('#lastWeek').hide();
            $('#nextWeek').hide();
            $('#messageBox').hide();
        }
    } else {
        //falls erstes Statement nicht zutrifft 
        //die Wochen-Buttons nicht anzeigen
        $('#lastWeek').hide();
        $('#nextWeek').hide();
        //den Klassen Selector und Titel nicht anzeigen
        $('#classTitle').hide();
        $('#classSelector').hide();
        //die MessageBox nicht anzeigen
        $('#messageBox').hide();
    }

    //Change-Listener für den Klassen Selector
    $('#classSelector').change(function(e) {
        if (this.value != 'Ihre Auswahl ...') {
            //Im LocalStorage die Klassen-ID setzten
            localStorage.setItem('klasse_id', this.value);
            //Stündenplan output aus der Tabelle löschen
            $('#tableOutput').empty();
            //den Wochen und Jahr anzeiger leeren und die MessageBox verstecken
            $('#week').empty();
            $('#messageBox').hide();
            //Methode für Tabelle füllen aufrufen und klassen id mitgeben
            tableFill(this.value);
        } else {
            $('#tableOutput').empty();
            $('#week').empty();
            $('#lastWeek').hide();
            $('#nextWeek').hide();
        }
    })

    //Change-Listener für Berufsauswahl aufrufen
    $('#jobSelector').change(function(e) {
        if (this.value != 'Ihre Auswahl ...') {
            //localStorage Beruf-id setzten
            localStorage.setItem('beruf_id', this.value);
            //Klassen ID auf leer setzten
            localStorage.setItem('klasse_id', '');
            //alle Elemente ausser den Berufs-Selector und Berufs-Titel 
            $('#classSelector').empty();
            $('#tableOutput').empty();
            $('#week').empty();
            $('#lastWeek').hide();
            $('#nextWeek').hide();
            $('#messageBox').hide();
            $('#classTitle').show();
            $('#classSelector').show();
            $('#errorMessage').hide();
            //Methode um Klassen-Selector füllen aufrufen und berufs-id mitgeben
            apiClassCall(this.value);
        } else {
            $('#errorMessage').hide();
            $('#classTitle').hide();
            $('#classSelector').hide();
            $('#tableOutput').empty();
            $('#week').empty();
            $('#lastWeek').hide();
            $('#nextWeek').hide();
        }
    })

    //Click-Listener für den Woche-Zurück Button
    $('#lastWeek').click(function(e) {
        //Wenn die aktuelle Woche 1 wird die Woche davor auf 53 gesetzt und das Jahr minus 1
        if (activeWeekNumber == 1) {
            activeWeekNumber = 53;
            activeYear--;
        }
        //aktuelle Woche Minus 1
        activeWeekNumber--;
        //im Localstorage auf week die Woche und Jahr setzten und noch einzeln das Jahr und die Woche setzten
        localStorage.setItem('week', `${activeWeekNumber}-${activeYear}`);
        localStorage.setItem("weekNumb", activeWeekNumber);
        localStorage.setItem("year", activeYear);
        //Methoden aufruf für Week-Selector ändern
        updateWeekSelector();
        //Tabellen output leeren
        $('#tableOutput').empty();
        //Tabelle mit Studenplan aktualiseren und Woche und Jahr mitgeben
        updateTabeloutput(localStorage.getItem('week'));
    });

    //Nächste Woche Button Click-Listener
    $('#nextWeek').click(function(e) {
        //Wenn die aktuelle Woche 52 ist die WOche auf 0 setzten und das Jahr plus 1
        if (activeWeekNumber == 52) {
            activeWeekNumber = 0;
            activeYear++;
        }
        //Woche plus 1
        activeWeekNumber++;
        //im Localstorage auf week die Woche und Jahr setzten und noch einzeln das Jahr und die Woche setzten
        localStorage.setItem('week', `${activeWeekNumber}-${activeYear}`);
        localStorage.setItem("weekNumb", activeWeekNumber);
        localStorage.setItem("year", activeYear);
        //Methoden aufruf für Week-Selector ändern
        updateWeekSelector();
        //Tabellen output leeren
        $('#tableOutput').empty();
        //Tabelle mit Studenplan aktualiseren und Woche und Jahr mitgeben
        updateTabeloutput(localStorage.getItem('week'));
    });

    //Wochen Selector aktualisieren
    function updateWeekSelector() {
        //MessageBox leeren und anzeigen
        $('#messageBox').empty();
        $('#messageBox').show();
        //Html Element mit Woche und Jahr füllen 
        document.getElementById('week').innerHTML = "Woche " + localStorage.getItem('week');
        //MessageBox füllen mit der Woche und Jahr
        $('#messageBox').append('<div class="alert alert-success">Neue Woche geladen! Woche: ' + localStorage.getItem('week') + ' </div>');
    }

    //Stundenplan output aktualisieren
    function updateTabeloutput(week) {
        //Synchrones laden der Daten über AJAX mit der Klassen id und Woche/Jahr als Parameter
        $.ajax({
            type: "GET",
            url: "http://sandbox.gibm.ch/tafel.php?klasse_id=" + localStorage.getItem('klasse_id') + "& woche=" + week,
            data: { format: 'json' },
            dataType: 'json'
        }).done(function(data) {
            if (data != '' && data != null) {
                //Tabellen Header und Inhalt wird befüllt durch geholte Daten
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
                $('#tableOutput').html('<div class="alert alert-warning">Keine Daten für Stundenplan vorhanden!</div>');
            }
        }).fail(function() {
            $('#tableOutput').html('<div class="alert alert-danger">Fehler Stundenplan konnte nicht gefüllt werden!</div>');
        })
    }

    //Befüllung des Berufsgruppen Selector
    $.ajax({
        type: "GET",
        url: "http://sandbox.gibm.ch/berufe.php",
        data: { format: 'JSON' },
        dataType: 'json'
    }).done(function(data) {
        //Befüllung des Selectors
        $('#jobSelector').append('<option>Ihre Auswahl ... </option>');
        $.each(data, function(key, value) {
            if (value.beruf_id == localStorage.getItem('beruf_id')) {
                $('#jobSelector').append('<option value="' + value.beruf_id + '" selected>' + value.beruf_name + '</option>')
            } else {
                $('#jobSelector').append('<option value=' + value.beruf_id + '>' + value.beruf_name + '</option>')
            }
        })
    }).fail(function() {
        $('#errorMessage').show();
        $('#errorMessage').html('<div class="alert alert-danger">Berufe konnten nicht geladen werden!</div>');
    });
    //Klassen Selector befüllen mithilfe von der Beruf ID
    function apiClassCall(beruf_id) {
        $.ajax({
            type: "GET",
            url: "http://sandbox.gibm.ch/klassen.php?beruf_id=" + beruf_id,
            data: { format: 'JSON' },
            dataType: 'json'
        }).done(function(data) {
            if (data != null && data != '') {
                //Befüllung des Selectors
                $('#classSelector').append('<option>Ihre Auswahl ... </option>');
                $.each(data, function(key, value) {
                    if (value.klasse_id == localStorage.getItem('klasse_id')) {
                        $('#classSelector').append('<option value="' + value.klasse_id + '" selected>' + value.klasse_longname + '</option>')
                    } else {
                        $('#classSelector').append('<option value=' + value.klasse_id + '>' + value.klasse_longname + '</option>')
                    }
                })
            } else {
                //den Klassen Selector und Titel nicht anzeigen
                $('#classTitle').hide();
                $('#classSelector').hide();
                $('#errorMessage').show();
                $('#errorMessage').html('<div class="alert alert-warning">Keine Klassen für diesen Beruf vorhanden!</div>');
            }
        }).fail(function() {
            $('#errorMessage').show();
            $('#errorMessage').html('<div class="alert alert-warning">Klassen konnten nicht geladen werden!</div>');
        })
    }
    //Array für Studenplan Wochen ermittlung
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

    //Studenplan Tabelle füllen mithilfe der Klassen ID
    function tableFill(klasse_id) {
        $.ajax({
            type: "GET",
            url: "http://sandbox.gibm.ch/tafel.php?klasse_id=" + klasse_id,
            data: { format: 'json' },
            dataType: 'json'
        }).done(function(data) {
            if (data != '' && data != null) {
                //Tabelle füllen
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
                    //Wochen Buttons anzeigen und Woche und Jahr auf die aktuelle setzten
                $('#lastWeek').show();
                $('#nextWeek').show();
                $('#week').append("Woche " + moment().format("WW-GGGG"));
                localStorage.setItem('week', moment().format("WW-GGGG"));
            } else {
                $('#tableOutput').html('<div class="alert alert-warning">Keine Daten für Studenplan vorhanden!</div>');
            }
        }).fail(function() {
            $('#tableOutput').html('<div class="alert alert-danger">Studenplan konnte nicht geladen werden!</div>');
        })
    }

})