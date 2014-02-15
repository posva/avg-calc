var AVGMARK = {
    total: [],
    coeffs: []
};

function markChange(me) {
    if (me.value.indexOf(',') != -1)
        me.value = me.value.replace(',', '.');
    me.value = parseFloat(me.value);
    if (me.value == "NaN" || isNaN(me.value))
        me.value = "";
    avgCalc();
}

function avgCalc() {
    AVGMARK.total = [];
    AVGMARK.coeffs = [];
    var avg = 0, n = 0;
    $(".mark-group .coeff").each(function(index, elem) {
        AVGMARK.coeffs[index] = (elem.value !== "")?parseFloat(elem.value):1;
        n += AVGMARK.coeffs[index];
    });
    $(".mark-group .mark").each(function(index, elem) {
        AVGMARK.total[index] = (elem.value !== "")?parseFloat(elem.value):0;
        avg += AVGMARK.total[index]*AVGMARK.coeffs[index];
    });
    if (n === 0) {
        n = 1;
        avg = 0;
    }
    $('#average').html(" "+(avg/n).toFixed(3));
    updateJSON();

}

function addMark(v, c) {
    $("#marks").append(markHTML(v, c));
    $("#marks div:last-child").show("fast");
    avgCalc();
    toggleMinus();
    $("#marks div:last-child").goTo();
}

function toggleMinus() {
    var buts = $("#marks .btn.btn-danger");
    if (buts.length > 1) {
        buts.removeClass("disabled");
    } else {
        buts.addClass("disabled");
    }
}

function delMark(elem) {
    $(elem).parent().parent().hide("fast", function() {
        this.remove();
        avgCalc();
        toggleMinus();
    });
}

function updateInputs(inp) {
    var keyboard="number";
    switch (inp) {
        case 'tel':
            if ($("#options #tel-key").is(":checked"))
                keyboard = "tel";
            $("#marks .mark-group input").attr("type", keyboard);
        break;

        case 'json':
            if ($("#options #display-json").is(":checked")) {
                $("#json-edit").parent().removeClass("hidden-sm hidden-xs").hide().show("fast");
            } else {
                $("#json-edit").parent().hide("fast", function() {$("#json-edit").parent().addClass("hidden-sm hidden-xs");});
            }
        break;

        default:
            break;
    }

}

function markHTML(v, c) {
    if (v === undefined)
        v = "";
    if (c === undefined)
        c = "";

    var keyboard="number";
    if ($("#options #tel-key").is(":checked"))
        keyboard = "tel";

    return '<div class="mark-group" style="display: none;"><div class="input-group">\
        <span class="input-group-addon btn btn-danger disabled" onclick="delMark(this)">\
          <span class="glyphicon glyphicon-minus"></span>\
        </span>\
        <input type="'+keyboard+'" value="'+v+'" class="form-control mark" onchange="markChange(this);" placeholder="Mark">\
        <input type="'+keyboard+'" value="'+c+'" class="form-control coeff" onchange="markChange(this);" placeholder="1.0">\
      </div><br></div>';
}

function delAllMark() {
    $(".mark-group").each(function(index, elem) {
        $(elem).hide("fast", function() {
            this.remove();
            avgCalc();
        })
    });
}

function updateJSON() {
    var space = '';
    AVGMARK.json = [];
    for (var i = 0; i < AVGMARK.total.length; i++)
        AVGMARK.json[i] = { v: AVGMARK.total[i],
                    c: AVGMARK.coeffs[i]
        };

        if ($("#json-edit #use-tabs").is(":checked"))
            space = '\t';
        $("#json-edit textarea").val(JSON.stringify(AVGMARK.json, null, space));
}

function updateFromJSON() {
    var json;
    try {
        json = $.parseJSON($("#json-edit textarea").val());
    } catch (e) {
        // make textarea red
        console.log("Error parsing json");
        $("#json-edit").addClass("has-error");
        return;
    }
    $("#json-edit").removeClass("has-error");

    AVGMARK.total = [];
    AVGMARK.coeffs = [];

    var last_ind = -1;
    var delButs = $(".mark-group .btn-danger");
    for (var i = 0; i < json.length; i++) {
        AVGMARK.total[i] = json[i].v;
        AVGMARK.coeffs[i] = json[i].c;
    }

    for (i = json.length; i < delButs.length; i++) {
        delButs.eq(i).click();
    }

    $(".mark-group .coeff").each(function(index, elem) {
        elem.value = AVGMARK.coeffs[index];
        last_ind = index;
    });

    $(".mark-group .mark").each(function(index, elem) {
        elem.value = AVGMARK.total[index];
        if (index > last_ind) last_ind = index;
    });

    // add missing buttons
    last_ind++;
    if (last_ind >= delButs.length) {
        for (i = last_ind; i < json.length; i++) {
            addMark(json[i].v, json[i].c);
        }
    }

    avgCalc();
}

function exportJSON() {
    var json = [];
    for (var i = 0; i < AVGMARK.total.length; i++)
        json[i] = { v: AVGMARK.total[i],
                    c: AVGMARK.coeffs[i]
        };
        //download("marks.json", JSON.stringify(json, null, '\t'));
}

function loadJSON(json) {
    for (var o in json) {
        addMark(o.v, o.c);
    }
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

(function($) {
    $.fn.goTo = function() {
        var ht = $('html, body');
        //if ($(this).offset().top > ht[0].scrollHeight - ht[0].scrollTop) {
            ht.animate({
                scrollTop: ($(this).offset().top-10) + 'px'
            }, 'fast');
        //}
        return this; // for chaining...
    }
})(jQuery);

$( document ).ready(function() {
    $(".disabled").removeClass("disabled");
    $(".glyphicon-edit").parent().attr("href", "#json-edit");
    $(".glyphicon-wrench").parent().attr("href", "#options");
    addMark();
});
