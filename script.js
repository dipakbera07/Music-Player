// console.log("Writing JS ..")
let currSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Ensure two-digit format for seconds
    return `${minutes}.${remainingSeconds.toString().padStart(2, '0')}`;
}
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        let element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }

    let isPlaying = !currSong.paused;
    
    //by default load the first song
    if (!isPlaying && songs.length > 0) {
        currSong.src = `/${currFolder}/` + encodeURIComponent(songs[0]);
        document.querySelector(".song-info1").innerHTML = decodeURI(songs[0]); // Update song name
        currSong.load();
        currSong.addEventListener("loadedmetadata", () => {
            document.querySelector(".song-time").innerHTML = `00.00 / ${formatTime(currSong.duration)}`;
        });
        // console.log("now");
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                        <img src="svgs/music.svg" alt="">
                        <div class="song-info">
                        <div> 
                        ${decodeURIComponent(song)}
                        </div>
                        </div>
                        <div class="play-now">play now</div>
                        <img src="svgs/play.svg" alt="">
                    </li>`;
    }

    // EventListner for each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".song-info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".song-info").firstElementChild.innerHTML.trim());
        })
    })

    return songs;
}

const playmusic = (track) => {
    let encodedTrack = encodeURIComponent(track);
    currSong.src = `/${currFolder}/` + encodedTrack;
    play.src = "svgs/pause.svg";
    currSong.play();
    document.querySelector(".song-info1").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00/00:00";
}


async function displayAlbums() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    // console.log(div);
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".container-part2-box1-cards");
    let array = Array.from(anchors)
    for (let i = 0; i < array.length; i++) {
        const e = array[i];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0];
            // console.log(folder);
            // get the meta data of every folder - -
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}" class="card1 card2">
                        <div class="card1-img card2-img">
                            <img src="songs/${folder}/cover.jpeg" alt="">
                        </div>
                        <div class="card2-footer">
                            <div class="card2-footer-h2">
                                <h2>${response.title}</h2>
                            </div>
                            <div class="card2-p">
                                <p>${response.description}</p>
                            </div>
                        </div>
                        <div class="play-button1">
                            <img src="svgs/play-button.svg" alt="">
                        </div>
                    </div>
            `

        }
    }

    // Load playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card2")).forEach((e) => {
        // console.log(e)
        e.addEventListener("click", async item => {
            // console.log(item,item.target.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })

}


async function main() {
    songs = await getSongs("songs/all");
    displayAlbums();

    // Play and pause for each song
    play.addEventListener("click", () => {
        if (currSong.paused) {  // No parentheses here
            currSong.play();
            play.src = "svgs/pause.svg";
        } else {
            currSong.pause();  // Use pause() method
            play.src = "play.svg";
            play.src = "svgs/play.svg"
        }
    });


    // Current song time update
    currSong.addEventListener("timeupdate", () => {
        // console.log(currSong.currentTime,currSong.duration);
        document.querySelector(".song-time").innerHTML = `${formatTime(currSong.currentTime)} / ${formatTime(currSong.duration)}`
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%";
    })

    // seekbar eventListner 
    document.querySelector(".bar").addEventListener("click", (e) => {
        let percernt = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percernt + "%";
        currSong.currentTime = ((currSong.duration) * percernt) / 100;
        // console.log(((currSong.duration)*percernt)/100)
    })

    // Action for hambergur
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".container-part1").style.left = "0";
        document.querySelector(".close").style.display = "block";
        document.querySelector(".hamburger").style.display = "none";
    })

    // Close hamberger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".container-part1").style.left = "-120%";
        document.querySelector(".hamburger").style.display = "block";
        document.querySelector(".close").style.display = "none";
    })

    // addEventListner for next
    next.addEventListener("click", () => {
        // console.log(decodeURI(currSong.src.split("/").pop()));
        let index = songs.indexOf(decodeURI((currSong.src.split("/").pop())));
        // console.log(index);
        console.log(songs,index);
        // console.log(songs.length);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1])
        }
    })
    // addEventListner for previous
    prev.addEventListener("click", () => {
        // console.log(decodeURI(currSong.src.split("/").pop()));
        let index = songs.indexOf(decodeURI(currSong.src.split("/").pop()));
        console.log(songs, index);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1])
        }
    })

    //action for volume range
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currSong.volume = parseInt(e.target.value) / 100;
        document.querySelector(".volume-change").innerHTML = `${e.target.value}%`;
    })

    // AddEventListner for volume up
    document.querySelector(".volume-up").addEventListener("click", () => {
        if (currSong.volume * 100 > 0) {
            currSong.volume = 0;
            // console.log("Volume is now 0")
            document.querySelector(".mute").style.display = "block";
            document.querySelector(".volume-up").style.display = "none";
            document.querySelector(".volume-change").innerHTML = "0%";
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }

    })

    // Eventlistner for mute
    document.querySelector(".mute").addEventListener("click", (e) => {
        if (currSong.volume * 100 == 0) {
            currSong.volume = 0.5;
            // console.log("Volume is now 50");
            document.querySelector(".mute").style.display = "none";
            document.querySelector(".volume-up").style.display = "block";
            document.querySelector(".volume-change").innerHTML = "50%";
        }
        document.querySelector(".volume").getElementsByTagName("input")[0].value = 50;

    })

    //dark mode 
    document.querySelector(".mode").addEventListener("click", () => {
        var element = document.getElementById('dark'),
        style = window.getComputedStyle(element),
        left = style.getPropertyValue('left');
    console.log(left);
        if (left == "1px") {
            console.log("40%")
            document.querySelector(".mode-circle").style.left = "40%";
            
            document.getElementsByTagName("nav")[0].style.backgroundColor = "white";
        
            document.querySelector(".nav-search").style.backgroundColor = "white";
            document.querySelector(".nav-search").style.border = "1px solid black";
            document.querySelector(".nav-search").children[3].style.filter = "invert(1)";
            document.querySelectorAll("p").forEach((e)=>{
                e.style.color="black";
            })
            document.querySelectorAll("h1").forEach((e)=>{
                e.style.color="black";
            })
            document.querySelectorAll("h2").forEach((e)=>{
                e.style.color="black";
            })
            document.querySelectorAll("button").forEach((e)=>{
                e.style.color="black";
            })
            document.querySelectorAll("div").forEach((e)=>{
                e.style.color="black";
            })
            document.querySelector(".mode-circle").style.backgroundColor = "white";
            document.querySelector(".mode").style.backgroundColor = "black";
            document.querySelector(".logo").style.filter = "invert(1)";
            document.querySelector(".logo").style.backgroundColor = "unset";
            document.querySelector(".logo").children[0].style.height = "40px";
            document.querySelector(".home").style.backgroundColor = "black";
            document.querySelector(".container ").style.backgroundColor = "white";
            document.querySelector(".container ").children[0].style.backgroundColor = "white";
            document.querySelector(".container ").children[1].style.backgroundColor = "white";
            document.querySelector(".playbar").style.backgroundColor = "white";
            // document.querySelector(".playbar").style.borderTop = "1px solid gray";
            document.querySelector(".seekbar").style.borderColor = "black";
            document.querySelector(".circle").style.backgroundColor = "black";
            document.querySelector(".songlist ").style.scrollbarColor = "lightgray white";
            document.querySelector(".container-part2-box2").style.scrollbarColor = "lightgray white";
            document.querySelector(".play-buttons").children[0].style.filter = "invert(0)";
            document.querySelector(".play-buttons").children[1].style.filter = "invert(0)";
            document.querySelector(".play-buttons").children[2].style.filter = "invert(0)";

            
            
        }
        else {
            console.log("2%")
            document.querySelector(".mode-circle").style.left = "2%";
            // document.querySelector(".mode-circle").style.backgroundColor = "black";
            // document.querySelector(".mode").style.backgroundColor = "white"
            document.getElementsByTagName("nav")[0].style.backgroundColor = "black";
        
            document.querySelector(".nav-search").style.backgroundColor = "rgb(48, 48, 48)";
            // document.querySelector(".nav-search").style.border = "1px solid white";
            document.querySelector(".nav-search").children[3].style.filter = "invert(0)";
            document.querySelectorAll("p").forEach((e)=>{
                e.style.color="rgb(175, 175, 175)";
            })
            document.querySelectorAll("h1").forEach((e)=>{
                e.style.color="white";
            })
            document.querySelectorAll("h2").forEach((e)=>{
                e.style.color="white";
            })
            document.querySelectorAll("button").forEach((e)=>{
                e.style.color="rgb(0, 0, 0)";
            })
            document.querySelectorAll("div").forEach((e)=>{
                e.style.color="rgb(230, 229, 229)";
            })
            document.querySelector(".home").style.backgroundColor = "rgba(42, 42, 42, 0.897)";
            document.querySelector(".your-library ").children[1].style.color = "rgb(205, 205, 205)";
            document.querySelector(".nav-part2-box2").children[0].children[1].style.color = "rgb(205, 205, 205)";
            document.querySelector(".nav-part2-box2").children[1].style.color = "rgb(205, 205, 205)";
            document.querySelector(".mode-circle").style.backgroundColor = "black";
            document.querySelector(".mode").style.backgroundColor = "white";
            document.querySelector(".logo").style.filter = "invert(0)";
            // document.querySelector(".logo").style.backgroundColor = "unset";
            document.querySelector(".logo").children[0].style.height = "35px";
            // document.querySelector(".home").style.backgroundColor = "white";
            document.querySelector(".container ").style.backgroundColor = "black";
            document.querySelector(".container ").children[0].style.backgroundColor = "rgb(19, 19, 19)";
            document.querySelector(".container ").children[1].style.backgroundColor = "rgb(19, 19, 19)";
            document.querySelector(".playbar").style.backgroundColor = "black";
            document.querySelector(".seekbar").style.borderColor = "white";
            document.querySelector(".circle").style.backgroundColor = "white";
            document.querySelector(".songlist ").style.scrollbarColor = "rgb(96, 96, 96) rgb(30, 30, 30)";
            document.querySelector(".container-part2-box2 ").style.scrollbarColor = "rgb(96, 96, 96) rgb(30, 30, 30)";
            document.querySelector(".play-buttons").children[0].style.filter = "invert(1)";
            document.querySelector(".play-buttons").children[1].style.filter = "invert(1)";
            document.querySelector(".play-buttons").children[2].style.filter = "invert(1)";

        }
    })


}

main();

