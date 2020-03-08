$(document).ready(function () {


    function createRoleStatuses(mojerole) {
        kopie = [0, 0, 0, 0, 0, 0, 0, 0]
        for (let i = 0; i < mojerole.length; i++) {
            kopie[i] = mojerole[i];
        }
        statusy = [0, 0, 0, 0, 0, 0, 0, 0];
        pocet = [0, 0, 0];

        for (j = 0; j < 3; j++) {
            max = Math.max(...kopie);
            if (max == -1) { break }
            for (var i = 0; i < kopie.length; i++) {
                var el = kopie[i];
                if (el == max) {
                    pocet[j]++;
                    statusy[i] = j + 1;
                    kopie[i] = -1;
                }
            }
        }
        if ((pocet[0] + pocet[1] + pocet[2]) > 3) {
            for (i = 0; i < statusy.length; i++) {
                if (statusy[i] == 3) statusy[i] = 0
            }
            if ((pocet[0] + pocet[1]) > 3) {
                for (i = 0; i < statusy.length; i++) {
                    if (statusy[i] == 2) statusy[i] = 0
                }
            }
        }
        return statusy;
    }


    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };
    parametry = getUrlParameter("ans").split("-");

    if (parametry.length == 8) {
        jeint = true;
        role = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < parametry.length; i++) {
            try {
                role[i] = parseInt(parametry[i]);
            } catch (error) {
                jeint = false;
            }
        }
        if (jeint) {
            var statusy = createRoleStatuses(role);

            $.post("http://localhost:3300/general", { "statusy[]": statusy },function (obecnaData) {
                var ctx = document.getElementById('myChart').getContext('2d');
                var myRadarChart = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'],
                        datasets: [
                            {
                                label: 'My Second dataset',
                                backgroundColor: 'rgba(255, 99, 132, 0.3)',
                                borderColor: 'rgb(255, 99, 132)',
                                data: role
                            },
                            {
                                label: 'My First dataset',
                                backgroundColor: 'rgba(150, 150, 150, 0.3)',
                                borderColor: 'rgb(150, 150, 150)',
                                data: obecnaData.hodnoty
                            }]
                    },
                    options: {
                        scale: {
                            ticks: {
                                suggestedMin: 0
                            }
                        }
                    }
                });
            });
        


        }
    } else {
        window.location.replace("C:/Users/petap/Documents/Maturitní%20práce/TymoveRole.eu/Frontend/404.html");

    }
})