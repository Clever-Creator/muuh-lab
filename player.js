const firebaseConfig = {
  apiKey: "AIzaSyAlbRzPaXf4Tw_f9oFM39Ca4Un0GsyvFeI",
  authDomain: "muul-lab.firebaseapp.com",
  databaseURL: "https://muul-lab-default-rtdb.firebaseio.com",
  projectId: "muul-lab",
  storageBucket: "muul-lab.firebasestorage.app",
  messagingSenderId: "289981524698",
  appId: "1:289981524698:web:f58c296609ca0bd4d253e3"
};

// Washa Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Pata ID kutoka URL (?id=...)
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('id');

if (videoId) {
    // Vuta data
    database.ref('movies/' + videoId).on('value', (snapshot) => {
        const video = snapshot.val();
        if (video) {
            // 1. Update Maandishi
            document.getElementById('video-title').innerText = video.title || "MUUH CINEMA";
            document.getElementById('view-count').innerText = video.views || 0;
            document.getElementById('upload-date').innerText = video.uploadedAt || "Hivi sasa";

            // 2. DAWA YA IFRAME (YouTube Embed Fix)
            let videoUrl = video.videoUrl || "";
            let embedId = "";

            if (videoUrl.includes("v=")) {
                embedId = videoUrl.split("v=")[1].split("&")[0];
            } else if (videoUrl.includes("youtu.be/")) {
                embedId = videoUrl.split("youtu.be/")[1].split("?")[0];
            } else {
                embedId = videoUrl; // Kama tayari ni ID
            }

            const playerContainer = document.getElementById('player-container');
            if (playerContainer) {
                playerContainer.innerHTML = `
                    <iframe width="100%" height="100%" 
                        src="https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0" 
                        frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                    </iframe>`;
            }
        }
    });

    // 3. View Counter (Transaction)
    database.ref('movies/' + videoId + '/views').transaction((c) => (c || 0) + 1);
}