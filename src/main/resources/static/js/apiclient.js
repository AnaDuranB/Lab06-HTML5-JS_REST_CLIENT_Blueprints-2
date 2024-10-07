var apiclient = (function () {
    var apiUrl = 'http://localhost:8080/blueprints';

    return {
        // Obtener todos los planos por autor
        getBlueprintsByAuthor: function (authname, callback) {
            return $.ajax({
                url: apiUrl + "/" + authname,
                type: "GET",
                contentType: "application/json",
                dataType: "json"
            }).done(function (data) {
                callback(data);
            }).fail(function (error) {
                console.error("Error retrieving the blueprints: ", error);
                callback(null);
            });
        },

        // Obtener un plano específico por autor y nombre
        getBlueprintsByNameAndAuthor: function (authname, bpname, callback) {
            return $.ajax({
                url: apiUrl + "/" + authname + "/" + bpname,
                type: "GET",
                contentType: "application/json",
                dataType: "json"
            }).done(function (data) {
                callback(data);
            }).fail(function (error) {
                console.error("Error retrieving the blueprints: ", error);
                callback(null);
            });
        },

        // Crear un nuevo plano
        addBlueprint: function (blueprint, callback) {
            return $.ajax({
                url: apiUrl,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(blueprint)
            }).done(function () {
                callback();
            }).fail(function (error) {
                console.error("Error retrieving the blueprint: ", error);
            });
        },

        // Actualizar un plano existente
        updateBlueprint: function (authname, bpname, updatedBlueprint, callback) {
            return $.ajax({
                url: apiUrl + "/" + authname + "/" + bpname,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(updatedBlueprint)
            }).done(function (data) {
                return data;
            }).fail(function (error) {
                console.error("Error updating the blueprints: ", error);
            });
        },

        // Eliminar un plano existente
        deleteBlueprint: function (author, blueprintName, callback) {
            return $.ajax({
                url: apiUrl + "/" + author + "/" + blueprintName,
                type: "DELETE",
                contentType: 'application/json'
            }).done(function () {
                callback();
            }).fail(function (error) {
                console.error("Error deleting the blueprints: ", error);
            });
        },

        // Obtener todos los planos
        getAllBlueprints: function (callback) {
            return $.ajax({
                url: apiUrl,
                type: "GET",
                contentType: "application/json",
                dataType: "json"
            }).done(function (data) {
                callback(data);
            }).fail(function (error) {
                console.error("Error retrieving the blueprints: ", error);
            });
        }
    };
})();
