(function () {

    function logout() {
        sessionStorage.removeItem("user_authenticated");
        sessionStorage.removeItem("authenticated_username");
        window.location.replace("/");
    }

    function checkSubscription() {

        /* Check login session */
        if (
            sessionStorage.getItem("user_authenticated") !== "true"
        ) {
            logout();
            return;
        }

        /* Get current username */
        const username =
            sessionStorage.getItem("authenticated_username");

        if (!username) {
            logout();
            return;
        }

        /* Check users database */
        if (!window.USERS_DATABASE) {
            logout();
            return;
        }

        /* Get current user */
        const user =
            window.USERS_DATABASE[username];

        if (!user || !user.expireDate) {
            logout();
            return;
        }

        /* Expiration date = end of expiration day */
        const expireDate =
            new Date(user.expireDate + "T23:59:59");

        if (Number.isNaN(expireDate.getTime())) {
            logout();
            return;
        }

        /* Subscription expired */
        if (new Date() > expireDate) {

            alert(
                "Your subscription has expired. Please contact the administrator for renewal."
            );

            logout();
        }
    }

    /* Check immediately */
    checkSubscription();

    /* Check every minute */
    setInterval(checkSubscription, 60000);

    /* Check when returning to the application */
    document.addEventListener(
        "visibilitychange",
        function () {

            if (!document.hidden) {
                checkSubscription();
            }

        }
    );

})();
