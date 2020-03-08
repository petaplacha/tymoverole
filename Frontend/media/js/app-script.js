$(document).ready(function () {
    var userData = [ 5,6,9,2,11,3,1,15 ];

    $('#mojetlacitko').click(function (event) {
        $.post("http://localhost:3300/vysledek", { 'score[]': userData },function (data) {
            strParam = userData[0];
            for (let i = 1; i < userData.length; i++) {
                strParam = strParam + "-" + userData[i];  
            }
            window.location.replace("C:/Users/petap/Documents/Maturitní%20práce/TymoveRole.eu/Frontend/vysledky.html?ans=" + strParam);
        });
        event.preventDefault();
       // window.location.replace("/vysledky.html");

    })
})