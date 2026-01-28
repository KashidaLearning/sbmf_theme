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
        var url = "/admin-dashboard/programs/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.admin-programs-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var url = "/admin-dashboard/programs/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-admin-program-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var url = "/admin-dashboard/programs/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });

    $("#search-student-enrollment").click(function () {
        $(".loading-image").removeClass('hidden')
        var program_id = this.dataset.program
        var url = "/admin-dashboard/programs/"+ program_id +"/enrollments/"
        var data = new FormData();
        prepare_formdata(data)
        get_data(data, url)
    });

    $(document).on('click', '.ase-pagination-btn', function(e) {
        $(".loading-image").removeClass('hidden')
        var page = this.dataset.page
        var program_id = this.dataset.program
        var url = "/admin-dashboard/programs/"+ program_id +"/enrollments/"
        var data = new FormData();
        data.append("page", page);
        prepare_formdata(data)
        get_data(data, url)
    });

    $("#download-admin-enrollment-report").click(function () {
        $(".report-download-msg").removeClass('hidden')
        var program_id = this.dataset.program
        var url = "/admin-dashboard/programs/"+ program_id +"/enrollments/generate/report/"
        var data = new FormData();
        prepare_formdata(data)
        setTimeout(hide_message, 300000);
        generate_report(data, url)
        $('html, body').animate({scrollTop: $(".download-area").offset().top}, 700);
    });
});