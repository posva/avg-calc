var AVGMARK = {
    total: [],
    coeffs: []
};

function markChange(me) {
    var tmp, error, butsN;
    if (me.value.indexOf(',') != -1)
        me.value = me.value.replace(',', '.');
    tmp = parseFloat(me.value);
    error = tmp == "NaN" || isNaN(tmp);
    if (me.validity.valid || !error) {
        butsN = avgCalc();
        if (AVGMARK.total.length == butsN)
            addMark();
    } else {
        $(me).parent().addClass("has-error");
    }
    //butId = getButtonIndex(me);
    //if (butId >= AVGMARK.total.length) {
        //$(".mark-group .btn-danger").eq(butId).click();
    //}
}

// unused at the moment
function getButtonIndex(me) {
    var but = -1;
    $(".mark-group .mark").each(function(index, elem) {
        if (me === this || me === elem)
            but = index;
    });
    return but;
}

// me is an optional parameter: object who trigered the event
// return the number of buttons that exist
// This is used in order to create or delete buttons for easier writing
function avgCalc() {
    AVGMARK.total = [];
    AVGMARK.coeffs = [];
    var sum = 0, n = 0, butsN = 0;
    $(".mark-group .coeff").each(function(index, elem) {
        if (elem.value === "") {
            AVGMARK.coeffs[index] = {
                val: 1,
                valid: false
            };
        } else {
            AVGMARK.coeffs[index] = {
                val: parseFloat(elem.value),
                valid: true
            };
        }
    });

    $(".mark-group .mark").each(function(index, elem) {
        butsN++;
        if (elem.value === "") {
            AVGMARK.total[index] = {
                val: 0,
                valid: false
            };
            //$(this).parent().addClass("has-error");
        } else {
            AVGMARK.total[index] = {
                val: parseFloat(elem.value),
                valid: true
            };
            $(this).parent().removeClass("has-error");
            n += AVGMARK.coeffs[index].val; // take into account default coeff
            sum += AVGMARK.total[index].val*AVGMARK.coeffs[index].val;
        }
    });

    if (n === 0) {
        n = 1;
        sum = 0;
    }
    $('#average').html(" "+(sum/n).toFixed(3));

    // remove invalid values before updating json
    for (var i = 0; i < AVGMARK.total.length; i++) {
        if (!AVGMARK.total[i].valid) {
            AVGMARK.total.splice(i, 1);
            AVGMARK.coeffs.splice(i, 1);
            i--;
        }
    }

    updateJSON();

    return butsN;
}

function addMark(v, w) {
    var mark, last;
    last = $("#marks div:last-child");
    $("#marks").append(markHTML(v, w));
    mark = $("#marks div:last-child");
    mark.show("fast");
    avgCalc();
    toggleMinus();
    $("#marks div:last-child .btn.btn-danger").tooltip({delay: { show: 350, hide: 0}});
    if (last.length > 0)
        last.goTo();
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

function markHTML(v, w) {
    if (v === undefined)
        v = "";
    if (w === undefined)
        w = "";

    var keyboard="number";
    if ($("#options #tel-key").is(":checked"))
        keyboard = "tel";

    return '<div class="mark-group" style="display: none;"><div class="input-group">\
        <span class="input-group-addon btn btn-danger disabled" onclick="delMark(this)" rel="tooltip" data-toggle="tooltip" data-placement="bottom" title="Remove this value">\
          <span class="glyphicon glyphicon-remove"></span>\
        </span>\
        <input type="'+keyboard+'" value="'+v+'" class="form-control mark" onkeyup="markChange(this);" onpaste="setTimeout(function() {markChange(this);}, 4);" placeholder="Value">\
        <input type="'+keyboard+'" value="'+w+'" class="form-control coeff" onkeyup="markChange(this);" onpaste="setTimeout(function() {markChange(this);}, 4);" placeholder="Weight (default: 1)">\
      </div><br></div>';
}

function delAllMark() {
    $(".mark-group").each(function(index, elem) {
        $(elem).hide("fast", function() {
            this.remove();
            avgCalc();
        });
    });
}

function updateJSON() {
    var space = '';
    AVGMARK.json = [];
    for (var i = 0; i < AVGMARK.total.length; i++)
    AVGMARK.json[i] = {
        v: AVGMARK.total[i].val,
        w: AVGMARK.coeffs[i].val
    };

    if ($("#json-edit #use-tabs").is(":checked"))
        space = '\t';
    $("#json-edit textarea").val(JSON.stringify(AVGMARK.json, null, space));
    $("#json-edit").removeClass("has-error");
}

function updateFromJSON() {
    var json, i;
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
    for (i = 0; i < json.length; i++) {
        AVGMARK.total[i] = {
            val: json[i].v,
            valid: true
        };
        AVGMARK.coeffs[i] = {
            val: json[i].w,
            valid: true
        };
    }

    for (i = json.length; i < delButs.length; i++) {
        delButs.eq(i).click();
    }

    $(".mark-group .coeff").each(function(index, elem) {
        if (index < AVGMARK.coeffs.length) {
            elem.value = AVGMARK.coeffs[index].val;
            last_ind = index;
        }
    });

    $(".mark-group .mark").each(function(index, elem) {
        if (index < AVGMARK.total.length) {
            elem.value = AVGMARK.total[index].val;
            if (index > last_ind) last_ind = index;
        }
    });

    // add missing buttons
    last_ind++;
    if (last_ind >= delButs.length) {
        for (i = last_ind; i < json.length; i++) {
            addMark(json[i].v, json[i].w);
        }
    }

    avgCalc();
}

function exportJSON() {
    var json = [];
    for (var i = 0; i < AVGMARK.total.length; i++)
        json[i] = { v: AVGMARK.total[i],
                    w: AVGMARK.coeffs[i]
        };
        //download("marks.json", JSON.stringify(json, null, '\t'));
}

function loadJSON(json) {
    for (var o in json) {
        addMark(o.v, o.w);
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
    };
})(jQuery);

$( document ).ready(function() {
    $(".disabled").removeClass("disabled");
    $(".glyphicon-edit").parent().attr("href", "#json-edit");
    $(".glyphicon-wrench").parent().attr("href", "#options");
    addMark();
    $("[rel='tooltip']").tooltip({delay: { show: 750, hide: 0}});
});
