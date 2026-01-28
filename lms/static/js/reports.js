$(document).ready(function() {
    if ($(".select-style").length) {
        $('.select-style').select2({
            minimumResultsForSearch: -1,
            dropdownAutoWidth : true,
            width: '100%',
        });
    }
});

$(document).ready(function() {
    // var start = moment().subtract(0, 'year').startOf('year');
    var start = moment("2022-10-14");
    var end = moment();

    var startDate = start.format('DD/MM/YYYY');
    var endDate = end.format('DD/MM/YYYY');

    function cb(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        dateLimit: {
            days: 185
        },
        ranges: {
           'All Time': [moment("2001-01-01"), moment()],
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
           'This Year': [moment().startOf('year'), moment().endOf('year')],
           'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
        },
        locale: {
            format: 'MMMM D, YYYY'
        },

    }, cb);

    cb(start, end);

    $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
        startDate = picker.startDate.format('DD/MM/YYYY');
        endDate = picker.endDate.format('DD/MM/YYYY');
    });

    cb(start, end);

    function hide_message(){
        $(".report-download-msg").addClass('hidden')
    }

    function generate_report(data, url, getReportURL){
        $(".download-btn a").off('click');
        $.ajax({
            type: "POST",
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            url: url,
            success: function(data) {
            }
        });
    }

    function get_data(data, url){
        $.ajax({
            type: "POST",
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            url: url,
            success: function(data) {
                if (data.data_avilable){
                    $(".download-report-btn").removeClass("disabled")
                    $(".download-report-btn").removeAttr("disabled");
                }else{
                    $(".download-report-btn").addClass("disabled")
                    $(".download-report-btn").attr('disabled', 'disabled')
                }
                $(".loading-image").addClass('hidden')
                $(".admin-report-div").html(data.data)
            }
        });
    }
    function prepare_formdata(data){
        data.append("csrfmiddlewaretoken", $("#csrfmiddlewaretoken").val())
        data.append("program", $("#program").val())
        data.append("student", $("#student").val());
        data.append("start_date", startDate)
        data.append("end_date", endDate)
        data.append("report_type", $("#report_type").val())
        data.append("user_type", $("#user_type").val())
        data.append("center", $("#center").val())
        data.append("gender", $("#gender").val())
    }

    $("#search-admin-program").click(function () {
        $(".loading-image").removeClass('hidden')
        var url = "/programs/admin-dashboard/programs/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.admin-programs-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var url = "/programs/admin-dashboard/programs/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-admin-program-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/programs/admin-dashboard/programs/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });


















    $("#send_invitation").click(function () {
        var data = new FormData();
        data.append("student_emails", $("#student-emails").val());
        data.append("course", $("#course").val());
        send_invitation(data)
    });

    $("#send_invitation_sms").click(function () {
        var data = new FormData();
        data.append("student_numbers", $("#student-numbers").val());
        data.append("country_code", $("#country_code").val());
        data.append("is_sms_invitation", true);
        send_invitation(data)
    });

    $("#search-ambassador-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/ambassador-dashboard/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.in-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/ambassador-dashboard/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-ambassador-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/ambassador-dashboard/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-student-course").click(function () {
        $(".loading-image").removeClass('hidden')
        var student_id = this.dataset.student
        var url = "/ambassador-dashboard/"+ student_id +"/enrollments/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.inc-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var student_id = this.dataset.student
        var url = "/ambassador-dashboard/"+ student_id +"/enrollments/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-student-enrollment-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var student_id = this.dataset.student
        var url = "/ambassador-dashboard/"+ student_id +"/enrollments/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-inactive-students").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/ambassador-dashboard/inactive/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.inactive-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/ambassador-dashboard/inactive/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-inactive-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/ambassador-dashboard/inactive/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-admin-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/admin-dashboard/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.admin-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/admin-dashboard/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-admin-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/admin-dashboard/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#download-supervisor-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/supervisor-dashboard/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-ambassador-student").click(function () {
        $(".loading-image").removeClass('hidden')
        var ambassador_id = this.dataset.ambassador
        var url = "/admin-dashboard/"+ ambassador_id +"/data/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.ambassador-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var ambassador_id = this.dataset.ambassador
        var url = "/admin-dashboard/"+ ambassador_id +"/data/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-ambassador-student-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var ambassador_id = this.dataset.ambassador
        var url = "/admin-dashboard/"+ ambassador_id +"/data/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-admin-student").click(function () {
        $(".loading-image").removeClass('hidden')
        var url = "/admin-dashboard/users/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.as-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var url = "/admin-dashboard/users/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-admin-student-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/admin-dashboard/users/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });



    $("#search-student-enrollment").click(function () {
        $(".loading-image").removeClass('hidden')
        var course_id = this.dataset.course
        var url = "/admin-dashboard/courses/"+ course_id +"/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.ase-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var course_id = this.dataset.course
        var url = "/admin-dashboard/courses/"+ course_id +"/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-admin-enrollment-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var course_id = this.dataset.course
        var url = "/admin-dashboard/courses/"+ course_id +"/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-supervisor-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/supervisor-dashboard/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.ins-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/supervisor-dashboard/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });


    $("#search-supervisor-other-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/supervisor-dashboard/others/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.sos-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/supervisor-dashboard/others/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-supervisor-other-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/supervisor-dashboard/others/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });


    $("#search-admin-school").click(function () {
        $(".loading-image").removeClass('hidden')
        var url = "/admin-dashboard/schools/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.aschool-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var url = "/admin-dashboard/schools/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-admin-school-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/admin-dashboard/schools/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });


    $("#search-supervisor-school").click(function () {
        $(".loading-image").removeClass('hidden')
        var url = "/supervisor-dashboard/schools/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.sschool-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var url = "/supervisor-dashboard/schools/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-supervisor-school-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/supervisor-dashboard/schools/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-school").click(function () {
        $(".loading-image").removeClass('hidden')
        var school_id = this.dataset.school
        var url = "/admin-dashboard/schools/"+ school_id +"/details/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.schoold-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var school_id = $("#school_id").val()
        var url = "/admin-dashboard/schools/"+ school_id +"/details/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });


    $("#download-school-details-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var school_id = $("#school_id").val()
        var url = "/admin-dashboard/schools/"+ school_id +"/details/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-mis-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/mis-dashboard/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.mis-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/mis-dashboard/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-mis-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/mis-dashboard/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-mis-school").click(function () {
        $(".loading-image").removeClass('hidden')
        var url = "/mis-dashboard/schools/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.misschool-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var url = "/mis-dashboard/schools/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-mis-school-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/mis-dashboard/schools/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#download-mis-course-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/mis-dashboard/courses/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#mis-search-student-enrollment").click(function () {
        $(".loading-image").removeClass('hidden')
        var course_id = this.dataset.course
        var url = "/mis-dashboard/courses/"+ course_id +"/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.misenroll-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var course_id = this.dataset.course
        var url = "/mis-dashboard/courses/"+ course_id +"/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-mis-enrollment-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var course_id = this.dataset.course
        var url = "/mis-dashboard/courses/"+ course_id +"/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });


    $("#download-top-school-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/supervisor-dashboard/top/schools/generate/report/"
        var data = new FormData();
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });


    $('.create-story').on('click', function() {
        $('#addStoryModal')[0].style.display = "block";
    });
    $('.btn-close').on('click', function() {
        $('.modal')[0].style.display = "none";
    });
    $('.delete-story').on('click', function() {
        var storyId = this.dataset['story']
        $("#confirm-delete-story").attr("data-storyId", storyId);
        $('#deleteModal')[0].style.display = "block";
    });
    var fireAjax = function(data, id, url){
        var url = url;
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        $.post({
            type: "POST",
            url: url,
            cache: false,
            processData: false,
            contentType: false,
            data: data,
            success: function(response, data){
                $(".loading-image").addClass('hidden')
                window.location.reload();
            },
            error: function(error){
                $(".loading-image").addClass('hidden')
                $("#"+id).prop("disabled", false);
                displayError(error)
            }
        })
    };

    var displayError = function(error){
        mainDiv = error.responseJSON.divId;
        error_message = error.responseJSON.errorMsg;
        error_class = "#"+mainDiv+" .error"
        error_message_class = error_class + " .message"
        saveChangeButtonId = error.responseJSON.saveChangeId
        if ($(error_class).hasClass("hidden")){
            $(error_class).removeClass("hidden")
        }
        $(error_message_class).html(error_message)
        $("#"+saveChangeButtonId).removeAttr("disabled")
    };

    var getCookie = function(name){
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    var createStory = function(){
        if($("#new-story")[0].checkValidity()){
            $(".loading-image").removeClass('hidden')
            this.setAttribute("disabled", true);
            var url = "/ambassador-dashboard/success/stories"
            var linkID = this.id
            var newData = new FormData();
            var inputs = $('#new-story').serializeArray();
            $.each(inputs, function (i, input) {
                newData.append(input.name, input.value)
            });
            newData.append('save-change-id', linkID)
            fireAjax(newData, linkID, url)
        }else{
            $("#new-story").validator('validate')
        }
    }
    var deleteStory = function(){
        this.setAttribute("disabled", true);
        var linkID = this.id
        var storyId = this.dataset.storyid
        var url = "/ambassador-dashboard/success/story/delete"
        var newData = new FormData();
        newData.append('story_id', storyId)
        newData.append('save-change-id', linkID)
        fireAjax(newData, linkID, url)
    }
    $("#create-story").bind('click', createStory);
    $("#confirm-delete-story").bind('click', deleteStory);

    $("#search-ambassador-latest-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/ambassador-dashboard/2022/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.lin-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/ambassador-dashboard/2022/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-ambassador-latest-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/ambassador-dashboard/2022/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-ambassador-invited-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var competition = this.dataset.competition
        var url = "/ambassador-dashboard/competition/invited-by-me/"+ competition +"/"
        prepare_formdata(data)
        get_data(data, url)
    });
    $(document).on('click', '.aid-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var page = this.dataset.page
        var competition = this.dataset.competition
        var url = "/ambassador-dashboard/competition/invited-by-me/"+ competition +"/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });
    $(".download-ambassador-invited-data").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var competition = this.dataset.competition
        var url = "/ambassador-dashboard/competition/invited-by-me/"+ competition +"/generate/report/"
        var data = new FormData();
        data.append("report-type", this.dataset.reportType);
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });


    $("#search-ambassador-my-school-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var competition = this.dataset.competition
        var url = "/ambassador-dashboard/competition/my-school/"+ competition +"/"
        prepare_formdata(data)
        get_data(data, url)
    });
    $(document).on('click', '.asd-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var page = this.dataset.page
        var competition = this.dataset.competition
        var url = "/ambassador-dashboard/competition/my-school/"+ competition +"/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });
    $(".download-ambassador-my-school-data").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var competition = this.dataset.competition
        var url = "/ambassador-dashboard/competition/my-school/"+ competition +"/generate/report/"
        var data = new FormData();
        data.append("report-type", this.dataset.reportType);
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-center-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/admin-dashboard/center/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.center-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/admin-dashboard/center/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#search-ambassador-center-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/admin-dashboard/center/ambassadors/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.amb-center-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/admin-dashboard/center/ambassadors/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#search-mis-center-data").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/mis-dashboard/center/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.mis-center-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/mis-dashboard/center/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $(".manually_condition").change(function () {
        var linkID = this.id
        var newData = new FormData();
        newData.append('condition_id', this.dataset.conditionid)
        var url = "/ambassador/update/condition/"
        fireAjax(newData, linkID, url)
    });

    $("#change-ambassador").click(function () {
        $(".loading-image").removeClass('hidden')
        var ambassadorKey = this.dataset.ambassadorkey
        var url = "/switch/ambassador/"+ ambassadorKey +"/confirm/"
        $.ajax({
            type: "POST",
            data: new FormData(),
            cache: false,
            processData: false,
            contentType: false,
            url: url,
            success: function(data) {
                $(".loading-image").addClass('hidden')
                if (data.success){
                    $(".success_msg").removeClass('hidden')
                }else{
                    $(".failure_msg").removeClass('hidden')
                }
            },
            error: function(error){
                $(".loading-image").addClass('hidden')
                $(".failure_msg").removeClass('hidden')
            }
        });
    })

    $("#download-ambassador-center-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/admin-dashboard/center/ambassadors/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#download-admin-center-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/admin-dashboard/center/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#ambassador-search-projects").click(function () {
        $(".loading-image").removeClass('hidden')
        var data = new FormData();
        var url = "/ambassador-dashboard/projects/"
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.asp-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/ambassador-dashboard/projects/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });


    function validateFile(file){
        var extenstions = file.name.split('.')
        var fsize = file.size;
        if (extenstions.length > 2) {
            alert('Multiple extenstion file not allowed.')
            return false
        }
        if (fsize > 115343360) {
            alert('File must be less than 100MB.')
            return false
        }
        return true
    }

    var uploadProject = function(){
        if($("#user-project-form")[0].checkValidity()){
            $(".loading-image").removeClass('hidden')
            this.setAttribute("disabled", true);
            var newData = new FormData();
            var project_file = $("#project_file")[0].files[0];
            var is_valid = validateFile(project_file)
            if (!is_valid){
                $(".loading-image").addClass('hidden')
                return false
            }
            newData.append('title', $("#title").val())
            newData.append('description', $("#description").val())
            newData.append('project_file', project_file)
            $.ajax({
                type: "POST",
                data: newData,
                cache: false,
                processData: false,
                contentType: false,
                url: "/dashboard/upload/project/",
                success: function(data) {
                    $(".loading-image").addClass('hidden')
                    if (data.success){
                        $(".response-msg-div").html(data.message)
                        $(".response-msg-div").addClass('success')
                        $(".response-msg-div").removeClass('hidden')
                        $("#upload-project-submit").remove()
                    }else{
                        $(".response-msg-div").html(data.errorMsg)
                        $(".response-msg-div").addClass('failure')
                        $(".response-msg-div").removeClass('hidden')
                    }
                },
                error: function(error){
                    $(".loading-image").addClass('hidden')
                    $(".failure_msg").removeClass('hidden')
                }
            });
        }else{
            $("#user-project-form").validator('validate')
        }
    }
    $("#upload-project-submit").bind('click', uploadProject);

    var ambassadorProjectReview = function(){
        if($("#ambassador-project-update-form")[0].checkValidity()){
            $(".loading-image").removeClass('hidden')
            this.setAttribute("disabled", true);
            var url = $("#ambassador-project-update-form").attr('action')
            var newData = new FormData();
            newData.append('score', $("#score").val())
            newData.append('project_status', $('input[name="project_status"]:checked').val())
            $.ajax({
                type: "POST",
                data: newData,
                cache: false,
                processData: false,
                contentType: false,
                url: url,
                success: function(data) {
                    $(".loading-image").addClass('hidden')
                    $("#ambassador-project-review-submit").prop("disabled", false);
                    if (data.success){
                        $(".response-msg-div").html(data.message)
                        $(".response-msg-div").addClass('success')
                        $(".response-msg-div").removeClass('hidden')
                    }else{
                        $(".response-msg-div").html(data.errorMsg)
                        $(".response-msg-div").addClass('failure')
                        $(".response-msg-div").removeClass('hidden')
                    }
                },
                error: function(error){
                    $(".loading-image").addClass('hidden')
                    alert("Something went wrong please try again")
                }
            });
        }else{
            $("#ambassador-project-update-form").validator('validate')
        }
    }
    $("#ambassador-project-review-submit").bind('click', ambassadorProjectReview);

    $('.add-school-winner').on('click', function() {
        $('#addSchoolWinnerModal')[0].style.display = "block";
    });

    $('.add-best-project').on('click', function() {
        $('#addBestProjectModal')[0].style.display = "block";
    });

    var addSchoolWinner = function(){
        if($("#school-winner-form")[0].checkValidity()){
            this.setAttribute("disabled", true);
            var url = "/ambassador-dashboard/projects/add/schoolwinner/"
            var newData = new FormData();
            var inputs = $('#new-story').serializeArray();
            newData.append("project_id", $("#project").val())
            $.ajax({
                type: "POST",
                data: newData,
                cache: false,
                processData: false,
                contentType: false,
                url: url,
                success: function(data) {
                    if (data.success){
                        $(".response-msg-div").html(data.message)
                        $(".response-msg-div").addClass('success')
                        $(".response-msg-div").removeClass('hidden')
                        setTimeout(function() {
                            location.reload();
                        }, 2000);
                    }else{
                        $(".response-msg-div").html(data.errorMsg)
                        $(".response-msg-div").addClass('failure')
                        $(".response-msg-div").removeClass('hidden')
                    }
                },
                error: function(error){
                    alert("Something went wrong please try again")
                }
            });
        }else{
            $("#school-winner-form").validator('validate')
        }
    }
    $("#add-school-winner-submit").bind('click', addSchoolWinner);

    $(document).on('click', '.ssp-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/supervisor-dashboard/projects/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.center-proj-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var data = new FormData();
        var url = "/admin-dashboard/center-wise/projects/"
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-admin-center-wise-projects-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/admin-dashboard/center-wise/projects/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-admin-schoolwise-projects").click(function () {
        $(".loading-image").removeClass('hidden')
        var url = "/admin-dashboard/school-wise/projects/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.school-proj-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var url = "/admin-dashboard/schools/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-admin-school-wise-projects-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/admin-dashboard/school-wise/projects/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#download-admin-projects-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/admin-dashboard/projects/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    var SupervisorProjectReview = function(){
        if($("#supervisor-project-update-form")[0].checkValidity()){
            $(".loading-image").removeClass('hidden')
            this.setAttribute("disabled", true);
            var url = $("#supervisor-project-update-form").attr('action')
            var newData = new FormData();
            newData.append('is_shortlisted', $('input[name="is_shortlisted"]:checked').val())
            newData.append('score', $("#score").val())
            $.ajax({
                type: "POST",
                data: newData,
                cache: false,
                processData: false,
                contentType: false,
                url: url,
                success: function(data) {
                    $(".loading-image").addClass('hidden')
                    $("#supervisor-project-review-submit").prop("disabled", false);
                    if (data.success){
                        $(".response-msg-div").html(data.message)
                        $(".response-msg-div").addClass('success')
                        $(".response-msg-div").removeClass('hidden')
                    }else{
                        $(".response-msg-div").html(data.errorMsg)
                        $(".response-msg-div").addClass('failure')
                        $(".response-msg-div").removeClass('hidden')
                    }
                },
                error: function(error){
                    $(".loading-image").addClass('hidden')
                    alert("Something went wrong please try again")
                }
            });
        }else{
            $("#supervisor-project-update-form").validator('validate')
        }
    }
    $("#supervisor-project-review-submit").bind('click', SupervisorProjectReview);

    $("#user_level").change(function () {
        var newData = new FormData();
        newData.append('level', $("#user_level").val())
        $.ajax({
            type: "POST",
            data: newData,
            cache: false,
            processData: false,
            contentType: false,
            url: "/supervisor-dashboard/get/category/projects/",
            success: function(data) {
                $("#best_project").html(data.data)
            },
            error: function(error){
                alert("Something went wrong please try again")
            }
        });
    });

    var addBestProject = function(){
        if($("#best-project-form")[0].checkValidity()){
            this.setAttribute("disabled", true);
            var url = "/supervisor-dashboard/projects/add/best-project/"
            var newData = new FormData();
            newData.append("project_id", $("#best_project").val())
            newData.append('level', $("#user_level").val())
            $.ajax({
                type: "POST",
                data: newData,
                cache: false,
                processData: false,
                contentType: false,
                url: url,
                success: function(data) {
                    if (data.success){
                        $(".response-msg-div").html(data.message)
                        $(".response-msg-div").addClass('success')
                        $(".response-msg-div").removeClass('hidden')
                        setTimeout(function() {
                            location.reload();
                        }, 2000);
                    }else{
                        $(".response-msg-div").html(data.errorMsg)
                        $(".response-msg-div").addClass('failure')
                        $(".response-msg-div").removeClass('hidden')
                    }
                },
                error: function(error){
                    alert("Something went wrong please try again")
                }
            });
        }else{
            $("#best-project-form").validator('validate')
        }
    }
    $("#select-best-project-submit").bind('click', addBestProject); 
});