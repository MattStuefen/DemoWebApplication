function FormField(formGroup, checkValidity, tooltip, fields) {
    this.controlElement = formGroup.children('.form-control')[0];
    this.value = this.controlElement.value;
    this.icon = formGroup.children('.glyphicon');
    this.icon.attr('data-original-title', tooltip);
    this.stateGlyphs = {
        error: 'glyphicon-remove',
        warning: 'glyphicon-warning-sign',
        success: 'glyphicon-ok'
    };

    this.validate = function () {
        if (!checkValidity) return true;

        var isValid = checkValidity(this.value, fields);
        this.setState((this.value != 0) ? isValid ? 'success' : 'error' : null);
        return isValid;
    };

    this.setState = function (state) {
        var currentState = this.getCurrentState();
        if (currentState != state) {
            this.clearFeedback(currentState);
            if (state) {
                formGroup.addClass('has-' + state);
                this.icon.addClass(this.stateGlyphs[state]);
            }
            this.icon.tooltip(state == 'error' ? 'enable' : 'disable')
        }
    };

    this.clearFeedback = function (currentState) {
        if (currentState != null) {
            formGroup.removeClass("has-" + currentState);
            this.icon.removeClass(this.stateGlyphs[currentState]);
        }
    };

    this.getCurrentState = function () {
        for (var state in this.stateGlyphs) {
            if (this.stateGlyphs.hasOwnProperty(state)) {
                if (formGroup.hasClass("has-" + state)) return state;
            }
        }
        return null;
    };
}

var formValidator = {
    validationFunctions: {
        username: function (username) {
            return username.length > 3;
        },
        password: function (password) {
            return /^(?=.*\d)(?=.*[a-zA-Z])\w{6,}$/.test(password);
        },
        confirm: function (password, fields) {
            return password == fields.password.value;
        },
        emailAddress: function (emailAddress) {
            return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(emailAddress);
        }
    },
    tooltips: {
        username: "Username must be at least 4 characters.",
        password: "Password must be at least 6 characters and contain at least 1 numeric value.",
        confirm: "The passwords don't match...",
        emailAddress: "At least make it look real."
    },
    validate: function (form_name) {
        var fields = this.getFields(form_name);
        return Object.keys(fields).reduce(function (valid, field) {
            return fields[field].validate() && valid;
        }, true);
    },
    getFields: function (form_name) {
        var form = $('#' + form_name + '-form');
        var formGroups = form.children('.form-group');
        var fields = {};
        for (var i = 0; i < formGroups.length; i++) {
            const name = formGroups.eq(i).children('.form-control').attr('name');
            fields[name] = new FormField(formGroups.eq(i), this.validationFunctions[name], this.tooltips[name], fields);
        }
        return fields;
    }
};

