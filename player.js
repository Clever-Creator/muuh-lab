// 1. Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAlbRzPaXf4Tw_f9oFM39Ca4Un0GsyvFeI",
  authDomain: "muul-lab.firebaseapp.com",
  databaseURL: "https://muul-lab-default-rtdb.firebaseio.com",
  projectId: "muul-lab",
  storageBucket: "muul-lab.firebasestorage.app",
  messagingSenderId: "289981524698",
  appId: "1:289981524698:web:f58c296609ca0bd4d253e3",
  measurementId: "G-HBM6XEERZR"
};

// 2. Washa Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 3. Pata ID kutoka kwenye URL (Mfano: player.html?id=-Nxyz...)
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('id');

window.onload = () => {
    if (videoId) {
        console.log("Inatafuta video yenye ID:", videoId);
        loadVideoData(videoId);
    } else {
        alert("Video ID haijapatikana!");
    }
};
// Hii function itabadilisha link ya kawaida kuwa ya embed
function getEmbedUrl(url) {
    let videoId = '';
    if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('embed/')) {
        return url; // Tayari ipo sawa
    }
    return `https://www.youtube.com/embed/${videoId}`;
}

// Sasa, unapochukua data kutoka Firestore na kuiweka kwenye iframe:
const videoUrl = data.youtubeUrl; // Link kutoka Database
const playerIframe = document.getElementById('video-player'); // Hakikisha iframe yako ina ID hii

playerIframe.src = getEmbedUrl(videoUrl);
function loadVideoData(id) {
    // Tunatumia .on ili namba ikibadilika kule Firebase, na huku ibadilike papo hapo
    database.ref('movies/' + id).on('value', (snapshot) => {
        const video = snapshot.val();
        
        if (video) {
            // 1. Update Title
            const titleElement = document.getElementById('video-title');
            if(titleElement) titleElement.innerText = video.title;

            // 2. Update Views kwenye Screen (Hapa ndio dawa ya 0)
            const viewElement = document.getElementById('view-count');
            if(viewElement) viewElement.innerText = video.views || 0;

            // 3. Update Date
            const dateElement = document.getElementById('upload-date');
            if(dateElement) dateElement.innerText = video.uploadedAt || "Leo";

            // 4. Load Video Player (Iframe) - Fanya hivi mara moja tu
            const playerContainer = document.getElementById('player-container');
            if (playerContainer && playerContainer.innerHTML.includes("Inapakia")) {
                let videoUrl = video.videoUrl;
                let embedId = "";

                if (videoUrl.includes("v=")) {
                    embedId = videoUrl.split("v=")[1].split("&")[0];
                } else if (videoUrl.includes("youtu.be/")) {
                    embedId = videoUrl.split("youtu.be/")[1].split("?")[0];
                }

                playerContainer.innerHTML = `
                    <iframe width="100%" height="100%" 
                        src="https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0" 
                        frameborder="0" allowfullscreen>
                    </iframe>`;
            }
        }
    });

    // 5. ONGEZA VIEW MOJA (Hii inafanya kazi kila page ikifunguliwa)
    database.ref('movies/' + id + '/views').transaction((currentViews) => {
        return (currentViews || 0) + 1;
    });
}