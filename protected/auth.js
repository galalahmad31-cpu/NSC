(function () {

    /* =========================================================
       GET DEVICE ID
       ========================================================= */

    function getDeviceId() {

        let deviceId =
            localStorage.getItem("nsc_device_id");

        if (!deviceId) {
            return null;
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
       LOAD DEVICES
       ========================================================= */

    function loadDevices(storageKey) {

        try {

            const savedDevices =
                localStorage.getItem(
                    storageKey
                );

            if (!savedDevices) {
                return [];
            }

            const parsed =
                JSON.parse(savedDevices);


            if (!Array.isArray(parsed)) {
                return [];
            }


            /*
             * Support old format:
             *
             * ["device1", "device2"]
             */

            return parsed
                .map(function (item, index) {

                    if (
                        typeof item === "string"
                    ) {

                        return {

                            id: item,

                            registeredAt:
                                index

                        };

                    }


                    if (
                        item &&
                        item.id
                    ) {

                        return item;

                    }


                    return null;

                })
                .filter(Boolean);

        } catch (error) {

            return [];

        }

    }


    /* =========================================================
       SAVE DEVICES
       ========================================================= */

    function saveDevices(
        storageKey,
        devices
    ) {

        localStorage.setItem(
            storageKey,
            JSON.stringify(devices)
        );

    }


    /* =========================================================
       ENFORCE DEVICE LIMIT
       ========================================================= */

    function enforceDeviceLimit(
        devices,
        maxDevices
    ) {

        if (
            !Number.isFinite(maxDevices) ||
            maxDevices < 1
        ) {

            maxDevices = 1;

        }


        /*
         * Oldest devices first.
         */

        devices.sort(
            function (a, b) {

                return (
                    Number(a.registeredAt || 0) -
                    Number(b.registeredAt || 0)
                );

            }
        );


        /*
         * Keep only the allowed number.
         */

        if (
            devices.length > maxDevices
        ) {

            devices =
                devices.slice(
                    0,
                    maxDevices
                );

        }


        return devices;

    }


    /* =========================================================
       CHECK SUBSCRIPTION
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


        /* =====================================================
           DEVICE BINDING
           ===================================================== */

        const currentDevice =
            getDeviceId();


        if (!currentDevice) {

            logout();
            return;

        }


        const storageKey =
            "nsc_devices_" + email;


        let devices =
            loadDevices(
                storageKey
            );


        /* -----------------------------------------------------
           Maximum devices
           Controlled by users.js
           ----------------------------------------------------- */

        let maxDevices =
            Number(
                user.maxDevices
            );


        if (
            !Number.isFinite(maxDevices) ||
            maxDevices < 1
        ) {

            maxDevices = 1;

        }


        /* -----------------------------------------------------
           Apply current device limit
           
           Example:
           
           5 devices registered
           maxDevices changed to 2
           
           → oldest 2 remain authorized
           → other 3 are removed
           ----------------------------------------------------- */

        devices =
            enforceDeviceLimit(
                devices,
                maxDevices
            );


        saveDevices(
            storageKey,
            devices
        );


        /* -----------------------------------------------------
           Check current device
           ----------------------------------------------------- */

        const authorized =
            devices.some(
                function (device) {

                    return (
                        device.id ===
                        currentDevice
                    );

                }
            );


        if (!authorized) {

            alert(
                "This device is not authorized for this account."
            );

            logout();
            return;

        }

    }


    /* =========================================================
       INITIAL CHECK
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
