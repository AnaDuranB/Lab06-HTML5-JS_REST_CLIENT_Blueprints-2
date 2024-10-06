var apiclient = (function () {
    var apiUrl = 'http://localhost:8080/blueprints';

    return {
        getBlueprintsByAuthor: function (authname, callback) {
            $.get(apiUrl + "/" + authname, function (data) {
                callback(data);
            }).fail(function (error) {
                console.error("Error al obtener los planos: ", error);
            });
        },

        getBlueprintsByNameAndAuthor: function (authname, bpname, callback) {
            $.get(apiUrl + "/" + authname + "/" + bpname, function (data) {
                callback(data);
            }).fail(function (error) {
                console.error("Error al obtener el plano: ", error);
            });
        }
    };
})();
