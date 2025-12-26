let INTRO_PLAYING = false;
let INTRO_FINISHED = false;
let ENROLL_INTRO_ACTIVE = false;
window.__RANK_POPUP_SHOWN__ = false;
window.__LAST_KNOWN_RANK__ = null;
let numCircles = 0;
let circleElements = [];

const circlesWrapper   = document.getElementById("circlesWrapper");
const coursescontainer = document.getElementById("coursescontainer");

const CONFIG = {
    positionPattern: [0, -1.5, -3, -1.5, 0, 1.5, 3, 1.5],
    verticalSpacing: 340,
};

const STATE_CONFIG = {
    completed: { icon: window.STATE_ICONS.completed },
    active:    { icon: window.STATE_ICONS.active },
    locked:    { icon: window.STATE_ICONS.locked }
};

function getAmplitude() {
    return window.innerWidth < 860 ? 40 : Math.min((window.innerWidth / 2) - 120, 100);
}

function getVerticalSpacing() {
    return window.innerWidth < 700 ? 260 : CONFIG.verticalSpacing;
}

function getPatternMultiplier(base) {
    return window.innerWidth < 700 ? base / 2 : base;
}


function createCircle(data, index) {
    const state = data.state || "locked";
    const circle = document.createElement("div");
    circle.className = `circle-item circle-item--${state}`;

    const isFirst = data.is_first_course === true;
    const isCompleted = (state === "completed");
    const iconToUse = (isFirst && isCompleted) ? window.FIRST_COMPLETED_BADGE : STATE_CONFIG[state].icon;

    if (data.is_special) {
        circle.classList.add("circle-item--special-layout");
        circle.innerHTML = `
            <div class="circle-content">
                <div class="state-icon state-icon--${state}">
                    <img width="100%" src="${iconToUse}">
                </div>
                <div class="circle-text-content">
                    <div class="circle-title">${data.title}</div>
                </div>
                <div class="circle-image-wrapper">
                    <div class="circle-image-container">
                        <img src="${data.icon}" class="circle-image">
                    </div>
                </div>
            </div>
        `;
    } else {
        circle.innerHTML = `
            <div class="circle-content">
                <div class="state-icon2 state-icon--${state}">
                    <img width="100%" src="${iconToUse}">
                </div>
                <div class="circle-image-wrapper2">
                    <div class="circle-image-container2">
                        <img src="${data.icon}" class="circle-image">
                    </div>
                </div>
            </div>
            <div class="circle-text-block2">
                <div class="circle-title">${data.title}</div>
            </div>
        `;
    }
  
    circle.addEventListener("click", () => {
    if (state === "locked") {
        document.body.dispatchEvent(new Event("lockedCourseClick"));
        return;
    }

    $('#courseFrame').attr('src', data.link);
    $('#courseModal').css('display', 'block');

    const wrapper = document.querySelector("#courseModal .iframe-wrapper");

    if (wrapper) {
        wrapper.classList.remove("completed-frame");

        if (data.state === "completed") {
            wrapper.classList.add("completed-frame");
        }
    }
});

    circlesWrapper.appendChild(circle);
    
    circleElements.push({
        index,
        element: circle
    });
    if (data.state === "completed" && Number(data.xpAward) > 0) {
        let xpBadge = circle.querySelector(".course-xp-badge");

        if (!xpBadge) {
            xpBadge = document.createElement("div");
            xpBadge.className = "course-xp-badge";
            circle.appendChild(xpBadge);
        }

        xpBadge.textContent = `+${Number(data.xpAward).toFixed(2)} XP`;
    } else {
        const existing = circle.querySelector(".course-xp-badge");
        if (existing) existing.remove();
    }
}
const CURRENT_PROGRAM_ID =
    document.body.dataset.programId || window.location.pathname;

const LAST_PROGRAM_ID =
    sessionStorage.getItem("lastProgramId");

if (LAST_PROGRAM_ID !== CURRENT_PROGRAM_ID) {
    window.__RANK_POPUP_SHOWN__ = false;
    window.__LAST_KNOWN_RANK__ = null;
}


sessionStorage.setItem("lastProgramId", CURRENT_PROGRAM_ID);


function calculatePosition(index) {
    const containerWidth = circlesWrapper.parentElement.offsetWidth;
    const centerX = containerWidth / 2;
    const amplitude = getAmplitude();
    const y = 100 + (index * getVerticalSpacing());
    const patternIndex = index % CONFIG.positionPattern.length;
    const multiplier = getPatternMultiplier(CONFIG.positionPattern[patternIndex]);
    const x = centerX + (multiplier * amplitude);
    return { x, y };
}

function updatePositions() {
    circleElements.forEach(({ index, element }) => {
        const { x, y } = calculatePosition(index);
        element.style.left = `${x}px`;
        element.style.top  = `${y}px`;
        if (window.innerWidth < 700) {
                    element.style.transform = "translateX(-50%)";
                } else {
                    element.style.transform = "translate(-50%, -50%)";
                }    
    });
    updateContainerHeight();
}

function updateContainerHeight() {
    if (!coursescontainer) return;
    if (circleElements.length === 0) {
        coursescontainer.style.minHeight = "600px";
        return;
    }
    const last = calculatePosition(circleElements.length - 1);
    coursescontainer.style.minHeight = `${last.y + 120}px`;
}

function initializeScene() {
     if (INTRO_PLAYING) return; 
    const data = window.coursePathData || [];
    if (!data.length || !circlesWrapper) return;

    numCircles = data.length;
    circlesWrapper.innerHTML = "";
    circleElements = [];

    data.forEach((item, index) => createCircle(item, index));
    applyPulseToActiveCourses();
    updatePositions();
    const justEnrolled = sessionStorage.getItem("programJustEnrolled") === "1";
    document.querySelectorAll(".circle-item").forEach(c => {
        if (justEnrolled && !INTRO_FINISHED) {
            c.classList.add("is-faded");
            c.classList.remove("is-visible");
        } else {
            c.classList.remove("is-faded");
            c.classList.add("is-visible");
        }
    });

   if (
    sessionStorage.getItem("programJustEnrolled") === "1" &&
    !INTRO_FINISHED &&
    !INTRO_PLAYING
    ) {
        setTimeout(playGameCourseIntro, 300);
    }

}

function updateBadgesPopup(badges) {
    const items = document.querySelectorAll("#my-badges-content .badge-item img");
    if (!items || !items.length) return;

    badges.forEach((b, i) => {
        if (!items[i]) return;
        if (b.icon && b.icon !== "") {
            items[i].src = b.icon;
        }
    });

}

function updateEvalStatus(evalData) {
    if (!evalData) return;

    updateEvalStatusInRoot(document.getElementById("leaderboard-content"), evalData);

    updateEvalStatusInRoot(document.querySelector("#popup-dynamic-content"), evalData);
}

function updateEvalStatusInRoot(root, evalData) {
    if (!root) return;

    const icons = window.EVAL_ICONS || {};

    function setSimpleEvalIcon(selector, statusKey) {
        const li = root.querySelector(selector);
        if (!li) return;

        const status = evalData[statusKey];

        li.querySelectorAll("img, .statusicon").forEach(el => el.remove());

        const wrapper = document.createElement("div");
        wrapper.className = "statusicon";

        const img = document.createElement("img");

        if (status === "completed") {
            img.src = icons.completed;
            img.className = "statuscomplete";
        } else {
            img.src = icons[status];
            img.className = "eval-icon";
        }

        wrapper.appendChild(img);
        li.appendChild(wrapper);
    }

    setSimpleEvalIcon(".eval-assignment", "assignment");
    setSimpleEvalIcon(".eval-pre", "pre");
    setSimpleEvalIcon(".eval-post", "post");

    const chLi = root.querySelector(".eval-challenges");
    if (chLi && evalData.challenges) {
        const { completed, total, status } = evalData.challenges;

        const labels = chLi.querySelectorAll(".label");
        if (labels.length > 0) {
            labels[0].textContent = `${completed}/${total}`;
        }

        chLi.querySelectorAll("img, .statusicon, .status-text").forEach(el => el.remove());

        if (status === "no_challenges") {
            const st = document.createElement("span");
            st.className = "status-text";
            st.textContent = "0/0";
            chLi.appendChild(st);
        } else {
            const wrapper = document.createElement("div");
            wrapper.className = "statusicon";

            const img = document.createElement("img");

            if (status === "completed") {
                img.src = icons.completed;
                img.className = "statuscomplete";
            } else {
                img.src = icons[status];
                img.className = "eval-icon";
            }

            wrapper.appendChild(img);
            chLi.appendChild(wrapper);
        }
    }
}

function renderLeaderboardInContainer(container, users, currentUser) {
    if (!container) return;

    if (currentUser) {
        const rankSpan = container.querySelector(".lh-rank-title span");
        if (rankSpan) {
            rankSpan.textContent = "المرتبة " + currentUser.rank;
        }

        const xpBold = container.querySelector(".lh-p b");
        if (xpBold) {
            xpBold.textContent = "XP " + currentUser.rank_points.toFixed(2);
        }

        const headerProgFill = container.querySelector(".lh-progress-fill");
        if (headerProgFill) {
            headerProgFill.style.width = currentUser.progress + "%";
        }
    }

    container.querySelectorAll(".leaderboard-row").forEach(row => row.remove());

    users.forEach((u, index) => {
        let colorClass;
        if (index === 0)      colorClass = "gold";
        else if (index === 1) colorClass = "silver";
        else if (index === 2) colorClass = "bronze";
        else if (index === 3) colorClass = "blue1";
        else                  colorClass = "blue2";

        const row = document.createElement("div");
        row.className = "leaderboard-row";

        row.innerHTML = `
            <div class="rank-box">${index + 1}</div>
            <div class="icon">
                <img src="${window.LEADERBOARD_AVATAR || ''}" alt="avatar">
            </div>
            <div class="row-right ${colorClass}">
                <div class="name pt0">${u.name}</div>
                <div class="pt2">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${u.progress}%"></div>
                    </div>
                </div>
                <div class="pt1">XP <b>${u.rank_points.toFixed(2)}</b></div>
            </div>
        `;

        container.appendChild(row);
    });
}


function updateLeaderboardPopup(leaderboardData) {
    if (!leaderboardData) return;

    const { top_users, current_user } = leaderboardData;

    const baseContainer =
        document.querySelector("#leaderboard-content .leaderboard");
    renderLeaderboardInContainer(baseContainer, top_users, current_user);

    const popupContainer =
        document.querySelector("#popup-dynamic-content .leaderboard");
    if (popupContainer) {
        renderLeaderboardInContainer(popupContainer, top_users, current_user);
    }
}


async function refreshCourseStatus() {
    if (ENROLL_INTRO_ACTIVE) return;   
    try {
        const response = await fetch(window.location.pathname + "?ajax=1");
        const raw = await response.text();

        if (raw.trim().startsWith("<")) {
            return;
        }

        const data = JSON.parse(raw);

       if (data.coursePathData?.items) {
            window.coursePathData = data.coursePathData.items;
            initializeScene();
            document.dispatchEvent(new Event("circlesRebuilt"));
        }
        document.addEventListener("circlesRebuilt", () => {
            applyPulseToActiveCourses();
        });


        if (typeof data.progress_percent !== "undefined") {
            const barFillOut = document.querySelector(".lh-progress-fill-out");
            const barValOut  = document.querySelector(".lh-progress-val-out");
            if (barFillOut) {
                barFillOut.style.width = `${data.progress_percent}%`;
            }
            if (barValOut) {
                barValOut.textContent = `${data.progress_percent}%`;
            }
        }

        if (Array.isArray(data.badges)) {
            window.lastBadgesData = data.badges;
            updateBadgesPopup(data.badges);
        }

       if (data.leaderboard && data.leaderboard.top_users) {
            window.lastLeaderboardData = data.leaderboard;
            window.LEADERBOARD_DATA = data.leaderboard.top_users || [];
            window.CURRENT_USER_RANK_DATA = data.leaderboard.current_user || null;

            updateLeaderboardPopup(data.leaderboard);
            checkRankChangeAndPopup();

        }

        if (data.eval) {
            updateEvalStatus(data.eval);
        }
    } catch (err) {}
}

const leaderboardIcon = document.getElementById("leaderboard");
if (leaderboardIcon) {
    leaderboardIcon.addEventListener("click", function () {
       if (window.lastLeaderboardData?.top_users) {
            updateLeaderboardPopup(window.lastLeaderboardData);
        }

    });
}

const myBadgesIcon = document.getElementById("my-badges");
if (myBadgesIcon) {
    myBadgesIcon.addEventListener("click", function () {
        if (Array.isArray(window.lastBadgesData)) {
            updateBadgesPopup(window.lastBadgesData);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initializeScene();
    refreshCourseStatus();
});

window.addEventListener("resize", () => {
    if (!circleElements.length) return;
    updatePositions();
});

window.addEventListener("message", (event) => {
    if (!event.data) return;
    if (event.data.event === "progress" || event.data.event === "completion") {
        refreshCourseStatus();
    }
});

function playGameCourseIntro() {
    if (INTRO_FINISHED || INTRO_PLAYING) return;

    if (ENROLL_INTRO_ACTIVE) return;

  
    if (sessionStorage.getItem("programJustEnrolled") !== "1") return;
    ENROLL_INTRO_ACTIVE = true;
    INTRO_PLAYING = true;
    function playTak() {
        if (!window.__AUDIO_UNLOCKED__) return;

        const sound = document.getElementById("takSound");
        if (!sound) return;

        sound.currentTime = 0;
        sound.play().catch(()=>{});
        }


    const circles = document.querySelectorAll(".circle-item");

    circles.forEach((circle, index) => {
        setTimeout(() => {
            circle.classList.remove("is-faded");
            circle.classList.add("is-visible");

            circle.classList.remove("game-pop");
            void circle.offsetHeight;
            circle.classList.add("game-pop");

            playTak();

           circle.scrollIntoView({ behavior: "smooth", block: "center" });

            setTimeout(() => {
                window.scrollBy({ top: -90, left: 0, behavior: "smooth" });
            }, 220)

        }, index * 420 + 180);
    });

   
    setTimeout(() => {
        sessionStorage.removeItem("programJustEnrolled");
        INTRO_PLAYING = false;
        ENROLL_INTRO_ACTIVE = false; 
        INTRO_FINISHED = true;
         showIntroPopup();
        setTimeout(() => {
            focusFirstCourse();
     }, 500);

    }, circles.length * 420 + 600);
}

function focusFirstCourse() {
    if (!INTRO_FINISHED) return;

    const first =
        document.querySelector(".circle-item--active") ||
        document.querySelector(".circle-item");

    if (!first) return;

    const y =
        first.getBoundingClientRect().top +
        window.pageYOffset -
        (window.innerHeight / 2) +
        80;

    window.scrollTo({ top: y, behavior: "smooth" });

    setTimeout(() => {
        first.classList.remove("pulse-focus");
        void first.offsetHeight;
        first.classList.add("pulse-focus");
    }, 450);

    function stopPulse() {
        first.classList.remove("pulse-focus");
        window.removeEventListener("wheel", stopPulse);
        window.removeEventListener("touchstart", stopPulse);
        first.removeEventListener("click", stopPulse);
    }

    window.addEventListener("wheel", stopPulse, { once: true });
    window.addEventListener("touchstart", stopPulse, { once: true });
    first.addEventListener("click", stopPulse, { once: true });
 

}
function showIntroPopup() {
    if (document.getElementById("introFullModal")) return;

    const overlay = document.createElement("div");
    overlay.id = "introFullModal";
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
        background: rgba(17, 13, 124, 0.5);
        backdrop-filter: blur(20px);
        overflow:auto;
    `;

    const content = document.createElement("div");
    content.className = "intro-content-container";

    content.innerHTML = `
       <div class="intro-image-wrapper">

            <div class="intro-yellow-header">
                طريق واحد، خطوات واضحة. أنه كل تحدي لفتح اللي بعده!
            </div>

            <span class="intro-close-btn">&times;</span>

            <!-- MAIN BACKGROUND IMAGE -->
            <img
                src="${window.MY_APP_ASSETS.popupImage}"
                class="main-intro-img"
                alt="Intro Path"
            >
        </div>

    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    const closePopup = () => {
        overlay.remove();
        document.querySelectorAll(".circle-item").forEach(c => {
        c.classList.remove("is-faded");
        c.classList.add("is-visible");
    });
        focusFirstCourse();
    };

    overlay.querySelector(".intro-close-btn").onclick = closePopup;
    overlay.onclick = (e) => {
        if (e.target === overlay) closePopup();
    };
}
function checkRankChangeAndPopup() {
    if (window.__RANK_POPUP_SHOWN__) return;

    if (!window.CURRENT_USER_RANK_DATA) return;
    if (!Array.isArray(window.LEADERBOARD_DATA)) return;

    const myRankNow = Number(window.CURRENT_USER_RANK_DATA.rank);
    if (!myRankNow) return;

    if (window.__LAST_KNOWN_RANK__ === null) {
        window.__LAST_KNOWN_RANK__ = myRankNow;
        return;
    }

    if (myRankNow >= window.__LAST_KNOWN_RANK__) {
        window.__LAST_KNOWN_RANK__ = myRankNow;
        return;
    }

    const loser = window.LEADERBOARD_DATA.find(
        u => Number(u.rank) === myRankNow + 1
    );

    if (!loser) {
        window.__LAST_KNOWN_RANK__ = myRankNow;
        return;
    }

    showRankPopup({
        winnerName: window.CURRENT_USER_RANK_DATA.name, 
        winnerRank: myRankNow,
        winnerXP: window.CURRENT_USER_RANK_DATA.rank_points,

        loserName: loser.name,
        loserRank: myRankNow + 1,
        loserXP: loser.rank_points
    });

    window.__RANK_POPUP_SHOWN__ = true;
    window.__LAST_KNOWN_RANK__ = myRankNow;
}

(function mobileAudioUnlockOnly() {
  let unlocked = false;

  function unlock() {
    if (unlocked) return;

    const sound = document.getElementById("takSound");
    if (!sound) return;

    sound.muted = true;
    const p = sound.play();

    const done = () => {
      try { sound.pause(); } catch(e){}
      sound.currentTime = 0;
      sound.muted = false;
      unlocked = true;
      window.__AUDIO_UNLOCKED__ = true; 
    };

    if (p && p.catch) p.catch(()=>{}).finally(done);
    else done();
  }

  window.addEventListener("touchstart", unlock, { once: true, passive: true });
  window.addEventListener("click", unlock, { once: true });
})();


function applyPulseToActiveCourses() {
    document.querySelectorAll(".circle-item").forEach(circle => {
        circle.classList.remove("pulse-focus");

        if (circle.classList.contains("circle-item--active") && !circle.classList.contains("circle-item--completed")) {
            circle.classList.add("pulse-focus");
        }

    });
}
