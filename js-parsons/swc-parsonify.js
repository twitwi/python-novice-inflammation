


$(function() {
    var scrollToView = function(element){
    var offset = element.offset().top;

    var visible_area_start = $(window).scrollTop();
    var visible_area_end = visible_area_start + window.innerHeight;

    // Not enough in the viewport (in the 3/4 top), so scroll to it
    if (offset < visible_area_start || offset > visible_area_start/4+visible_area_end*3/4){
         $('html,body').animate({scrollTop: offset - window.innerHeight/2}, 1000);
         return false;
    }
    return true;
    }
    var testsWrap = function(t) {
        return '' +
            'import unittestparson\n' +
            '\n' +
            'import sys\n' +
            'def capture_stdout():\n' +
            '  from io import StringIO\n' +
            '  sys.stdout = StringIO()\n' +
            'def uncapture_stdout():\n' +
            '  txt = sys.stdout.getvalue()\n' +
            '  sys.stdout = sys.__stdout__\n' +
            '  return txt.splitlines()\n' +
            '\n' +
            'class myTests(unittestparson.unittest):\n' +
            '  '+t.replace('\n', '\n  ') +
            '\n' +
            '_test_result = myTests().main()\n' +
            '\n';
    };
    $('.challenge:has(.parsons-lines)').each(function (i) {
        var e = $('.panel-body', this);

        // Injecting html snippet
        var cont = $('<div class="container parsons-container"/>');
        var row = $('<div class="row"/>');
        $(row).append('<div id="stash-'+i+'" class="sortable-code col-xs-12 col-sm-4" />');
        $(row).append('<div id="compose-'+i+'" class="sortable-code col-xs-12 col-sm-8" />');
        $(cont).append(row);
        $(e).append(cont);
        $(e).append('<p style="clear:both"><a href="#" class="newInstanceLink">(Reset)</a><a href="#" class="feedbackLink">Submit and get feedback below</a></p>');
        $(e).append('<div class="unittest" />');
        $(e).append('<div class="unittest-after" />');

        // Get and remove the exercice description 
        var data = {};
        var lines = $('.parsons-lines', e).text();
        $('.parsons-lines', e).detach();
        if ($('.parsons-tests', e).size() > 0) {
            data.tests = $('.parsons-tests', e).text();
            data.tests = testsWrap(data.tests);
            $('.parsons-tests', e).detach();
        }
        if ($('.parsons-vartests', e).size() > 0) {
            data.vartests = $('.parsons-vartests', e).text();
            data.vartests = JSON.parse(data.vartests);
            $('.parsons-vartests', e).detach();
        }
        if ($('.parsons-output', e).size() > 0) {
            data.output = $('.parsons-output', e).text();
            $('.parsons-output', e).detach();
        }
        if ($('.parsons-variables', e).size() > 0) {
            data.variables = $('.parsons-variables', e).text();
            data.variables = JSON.parse(data.variables);
            $('.parsons-variables', e).detach();
        }

        // Setup parsons
        var pconf = {
            sortableId: 'compose-'+i,
            trashId: 'stash-'+i,
            max_wrong_lines: 1,
            vartests: [ // {initcode: "min = None\na = 0\nb = 2", code: "", message: "Testing with a = 0 ja b = 2", variables: {min: 0}},
            ],
            grader: ParsonsWidget._graders.LanguageTranslationGrader,
            executable_code: lines, // as we are typing python directly
            programmingLang: 'python'
        };
        if (data.tests) {
            pconf.unittests = data.tests;
        }
        if (data.vartests) {
            pconf.vartests = data.vartests;
        }
        if (data.output) {
            pconf.vartests = [{initcode:"", code:"", message:"Wrong output", variables: {"__output": data.output}}];
        }
        if (data.variables) {
            pconf.vartests = [{initcode:"", code:"", message:"Wrong output", variables: data.variables}];
        }

        var p = new ParsonsWidget(pconf);
        p.init(lines);
        p.shuffleLines();
        $('.newInstanceLink', e).click(function(event){
            event.preventDefault();
            p.shuffleLines();
        });
        $('.feedbackLink', e).click(function(event){
            event.preventDefault();
            var fb = p.getFeedback();
            $('.unittest', e).html('<h2>Feedback from testing your program:</h2>' + fb.feedback);
            scrollToView($('.unittest', e));
        });
    });
});
