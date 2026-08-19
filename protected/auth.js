(function () {

    /* =========================================================
       DEVICE ID
       Each browser/device receives its own local identifier.
       Maximum allowed devices = 2.
       ========================================================= */

    function getDeviceId() {

        let deviceId =
            localStorage.getItem("nsc_device_id");

        if (!deviceId) {

            if (
                window.crypto &&
                crypto.randomUUID
            ) {
                deviceId = crypto.randomUUID();
            } else {

                deviceId =
                    "NSC-" +
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .substring(2);
            }

            localStorage.setItem(
                "nsc_device_id",
                deviceId
            );
        }

        return deviceId;
    }


    /* =========================================================
       LOGOUT
       ========================================================= */

    function logout() {

        sessionStorage.removeItem(
            "user_authenticated"
        );

        sessionStorage.removeItem(
            "authenticated_email"
        );

        window.location.replace("/");
    }


    /* =========================================================
       CHECK SUBSCRIPTION + DEVICE
       ========================================================= */

    function checkSubscription() {

        /* -----------------------------------------------------
           Check login session
           ----------------------------------------------------- */

        if (
            sessionStorage.getItem(
                "user_authenticated"
            ) !== "true"
        ) {

            logout();
            return;
        }


        /* -----------------------------------------------------
           Get authenticated email
           ----------------------------------------------------- */

        const email =
            sessionStorage.getItem(
                "authenticated_email"
            );


        if (!email) {

            logout();
            return;
        }


        /* -----------------------------------------------------
           Check users database
           ----------------------------------------------------- */

        if (!window.USERS_DATABASE) {

            logout();
            return;
        }


        /* -----------------------------------------------------
           Get current user
           ----------------------------------------------------- */

        const user =
            window.USERS_DATABASE[email];


        if (
            !user ||
            !user.expireDate
        ) {

            logout();
            return;
        }


        /* -----------------------------------------------------
           Expiration date
           ----------------------------------------------------- */

        const expireDate =
            new Date(
                user.expireDate +
                "T23:59:59"
            );


        if (
            Number.isNaN(
                expireDate.getTime()
            )
        ) {

            logout();
            return;
        }


        /* -----------------------------------------------------
           Subscription expired
           ----------------------------------------------------- */

        if (
            new Date() > expireDate
        ) {

            alert(
                "Your subscription has expired. Please contact the administrator for renewal."
            );

            logout();
            return;
        }


        /* -----------------------------------------------------
           DEVICE BINDING
           ----------------------------------------------------- */

        const currentDevice =
            getDeviceId();


        /*
         * Device IDs registered during login
         * are stored locally for this account.
         */

        const storageKey =
            "nsc_devices_" + email;


        let devices = [];

        try {

            const savedDevices =
                localStorage.getItem(
                    storageKey
                );

            if (savedDevices) {

                devices =
                    JSON.parse(
                        savedDevices
                    );

            }

        } catch (error) {

            devices = [];

        }


        /* -----------------------------------------------------
           Maximum devices
           ----------------------------------------------------- */

        const maxDevices =
            Number(
                user.maxDevices || 2
            );


        /* -----------------------------------------------------
           Current device must be registered
           ----------------------------------------------------- */

        if (
            !devices.includes(
                currentDevice
            )
        ) {

            alert(
                "This device is not authorized for this account."
            );

            logout();
            return;
        }


        /* -----------------------------------------------------
           Too many devices
           ----------------------------------------------------- */

        if (
            devices.length > maxDevices
        ) {

            alert(
                "The maximum number of authorized devices has been exceeded."
            );

            logout();
            return;
        }

    }


    /* =========================================================
       CHECK IMMEDIATELY
       ========================================================= */

    checkSubscription();


    /* =========================================================
       CHECK EVERY MINUTE
       ========================================================= */

    setInterval(
        checkSubscription,
        60000
    );


    /* =========================================================
       CHECK WHEN RETURNING TO APPLICATION
       ========================================================= */

    document.addEventListener(
        "visibilitychange",
        function () {

            if (!document.hidden) {

                checkSubscription();

            }

        }
    );

})();
