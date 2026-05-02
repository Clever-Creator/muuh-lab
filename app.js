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
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} catch (e) {
    console.error("Firebase initialization failed", e);
}

const database = firebase.database();

// 3. LOGIC YA SPLASH SCREEN
function hideSplash() {
    const splash = document.getElementById('splash-screen');
    const loader = document.getElementById('loader'); 
    
    if (splash) {
        splash.style.transition = "opacity 0.5s ease";
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            if (loader) loader.style.display = 'none';
            console.log("MUUH Lab: Splash and Loader hidden.");
        }, 500);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(hideSplash, 2000); 
    loadMUUHApp();
    loadActors(); // Tumeongeza hii ili ivute wasanii pia
});

// 4. KUPATA DATA ZA FILAMU
function loadMUUHApp() {
    console.log("Inasoma data kutoka Firebase...");
    // Tunatumia 'videos' kwa sababu ndio path uliyotumia kule Admin
    database.ref('videos').on('value', (snapshot) => {
        const data = snapshot.val();
        let moviesArray = [];
        if (data) {
            for (let id in data) {
                moviesArray.push({ firebaseId: id, ...data[id] });
            }
            renderMUUHGrids(moviesArray);
        }
    }, (error) => {
        console.error("Firebase read error: ", error);
    });
}

// 5. KUPANGA KWENYE SCREEN (IMEBORESHWA)
function renderMUUHGrids(movies) {
    const recentGrid = document.getElementById('recent-grid');
    const trendingGrid = document.getElementById('trending-grid');
    const shortsGrid = document.getElementById('shorts-grid');
    const seriesGrid = document.getElementById('series-grid');

    if(recentGrid) recentGrid.innerHTML = '';
    if(trendingGrid) trendingGrid.innerHTML = '';
    if(shortsGrid) shortsGrid.innerHTML = '';
    if(seriesGrid) seriesGrid.innerHTML = '';

    movies.forEach(movie => {
        // HAPA NDIPO TUNAPOELEKEZA KWENYE WATCH.HTML
        const card = `
            <div class="series-card" onclick="window.location.href='watch.html?v=${movie.firebaseId}'" style="cursor:pointer;">
                <div class="card-img-container">
                    <img src="${movie.thumb || movie.poster}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/200x300?text=MUUH+LAB'">
                </div>
                <div class="series-info" style="padding:10px;">
                    <h3 style="font-size:14px; margin:0;">${movie.title}</h3>
                    <p style="font-size:11px; color:#D4AF37; margin:5px 0 0 0;">👁️ ${movie.views || 0} Views</p>
                </div>
            </div>
        `;

        // Panga kulingana na Category uliyoweka kule Admin
        if (shortsGrid && movie.category === 'shorts') {
            shortsGrid.innerHTML += card;
        } else if (seriesGrid && (movie.category === 'series' || movie.category === 'movie')) {
            seriesGrid.innerHTML += card;
        }

        // Kwa sasa tunaweka zote kwenye Recent kwa majaribio
        if (recentGrid) recentGrid.innerHTML += card;
    });
}

// 6. KUVUTA WASANII KWENYE INDEX (TOP ACTORS)
function loadActors() {
    const actorsGrid = document.getElementById('actors-grid');
    if(!actorsGrid) return;

    database.ref('actors').limitToFirst(10).on('value', (snap) => {
        actorsGrid.innerHTML = "";
        snap.forEach(child => {
            const actor = child.val();
            actorsGrid.innerHTML += `
                <div class="actor-card" onclick="location.href='profile.html?id=${child.key}'" style="text-align:center; min-width:100px; cursor:pointer;">
                    <img src="${actor.imageUrl}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid #D4AF37;">
                    <p style="font-size:11px; margin-top:5px; color:white;">${actor.nickname || actor.name}</p>
                </div>
            `;
        });
    });
}

// RATING & BOOKING LOGIC
function submitRating(rating) {
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('id');
    if (!artistId) return;

    database.ref('actors/' + artistId + '/ratings').transaction((current) => {
        if (!current) return { total_points: rating, count: 1 };
        return {
            total_points: (current.total_points || 0) + rating,
            count: (current.count || 0) + 1
        };
    }).then(() => alert("Asante kwa kura yako! ⭐"));
}

function sendBooking() {
    const name = document.getElementById('client-name').value;
    const job = document.getElementById('client-job').value;
    const artist = document.getElementById('artist-name') ? document.getElementById('artist-name').innerText : "Artist";
    
    if(!name || !job) return alert("Jaza jina na kazi!");

    const message = `Habari MUUH LAB, naitwa ${name}. Nahitaji kum-book msanii wenu ${artist} kwa ajili ya kazi ya: ${job}.`;
    const myNumber = "255767000000"; 
    window.open(`https://wa.me/${myNumber}?text=${encodeURIComponent(message)}`, '_blank');
}
// SEARCH LOGIC
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const allCards = document.querySelectorAll('.series-card'); // Hakikisha class inalingana na kadi zako

    allCards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        if (title.includes(term)) {
            card.style.display = "block"; // Onyesha
        } else {
            card.style.display = "none"; // Ficha
        }
    });

    // Kama amefuta kila kitu, onyesha zote
    if(term === "") {
        allCards.forEach(card => card.style.display = "block");
    }
});