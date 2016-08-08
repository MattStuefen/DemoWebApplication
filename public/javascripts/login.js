$(document).ready(function() {
    $('#login-form').submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: '/login',
            type: 'post',
            data: $('#login-form').serialize(),
            success: function (content) {
                window.location.reload();
            },
            error: function (content){
                alert("fail")
            }
        });
    });
});