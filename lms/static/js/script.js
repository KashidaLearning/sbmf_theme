let numCircles = 0;
let circleElements = [];

const circlesWrapper = document.getElementById("circlesWrapper");
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
    return window.innerWidth < 600 ? 60 : Math.min((window.innerWidth / 2) - 120, 100);
}

function getVerticalSpacing() {
    return window.innerWidth < 600 ? 260 : CONFIG.verticalSpacing;
}

function getPatternMultiplier(base) {
    return window.innerWidth < 600 ? base / 2 : base;
}

/* =========================
   CREATE COURSE CIRCLES
   ========================= */
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
                    <img width="60" src="${iconToUse}">
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
                    <img width="60" src="${iconToUse}">
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
    });

    circlesWrapper.appendChild(circle);

    circleElements.push({
        index: index,
        element: circle
    });
}

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
        element.style.top = `${y}px`;
        element.style.transform = "translate(-50%, -50%)";
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
    const data = window.coursePathData || [];
    if (!data.length || !circlesWrapper) return;

    numCircles = data.length;

    circlesWrapper.innerHTML = "";
    circleElements = [];

    data.forEach((item, index) => createCircle(item, index));
    updatePositions();
}

/* =========================
   POPUP CONTENT HELPERS
   ========================= */
function updateBadgesPopup(badges) {
    const wrapper = document.querySelector("#my-badges-content .badge-grid");
    if (!wrapper) return;
    wrapper.innerHTML = "";
    badges.forEach(b => {
        wrapper.innerHTML += `
            <div class="badge-item">
                <img src="${b.icon}">
            </div>
        `;
    });
}

function updateLeaderboardPopup(leaderboard) {
    const container = document.querySelector("#leaderboard-content .leaderboard");
    if (!container) return;

    // Remove previous Mako rows
    container.querySelectorAll(".leaderboard-row").forEach(el => el.remove());

    leaderboard.forEach((u, index) => {
        let colorClass;
        if (index === 0) colorClass = "gold";
        else if (index === 1) colorClass = "silver";
        else if (index === 2) colorClass = "bronze";
        else if (index === 3) colorClass = "blue1";
        else colorClass = "blue2";

        const row = document.createElement("div");
        row.className = "leaderboard-row";

        row.innerHTML = `
            <div class="rank-box">${index + 1}</div>
            <div class="icon">
                <img src="${window.LEADERBOARD_AVATAR || '/static/images/image-profile-blue.png'}" alt="">
            </div>
            <div class="row-right ${colorClass}">
                <div class="name pt0">${u.name}</div>
                <div class="pt2">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${u.progress}%"></div>
                    </div>
                </div>
                <div class="pt1">XP <b>${u.xp}</b></div>
            </div>
        `;

        container.appendChild(row);
    });
}

/* =========================
   AJAX REFRESH
   ========================= */
async function refreshCourseStatus() {
    try {
        const response = await fetch(window.location.pathname + "?ajax=1");

        const raw = await response.text();
        if (raw.trim().startsWith("<")) return;

        const data = JSON.parse(raw);

        /* Update circles */
        if (data.coursePathDataJSON) {
            const parsed = JSON.parse(data.coursePathDataJSON);
            window.coursePathData = parsed.items;
            initializeScene();
        }

        /* Update global progress */
        if (typeof data.progress_percent !== "undefined") {
            document.querySelector(".lh-progress-fill-out").style.width = `${data.progress_percent}%`;
            document.querySelector(".lh-progress-val-out").textContent = `${data.progress_percent}%`;
        }

        /* BADGES */
        if (Array.isArray(data.badges)) {
            window.lastBadgesData = data.badges;
            updateBadgesPopup(data.badges);
        }

        /* LEADERBOARD */
        if (Array.isArray(data.leaderboard)) {
            window.lastLeaderboardData = data.leaderboard;
            updateLeaderboardPopup(data.leaderboard);
        }

    } catch (err) {
        console.error("refreshCourseStatus failed:", err);
    }
}

/* =========================
   EVENT: OPEN POPUP → REFRESH CONTENT
   ========================= */
document.getElementById("leaderboard").addEventListener("click", function () {
    const container = document.querySelector("#leaderboard-content .leaderboard");
    if (!container) return;

    container.querySelectorAll(".leaderboard-row").forEach(el => el.remove());

    if (Array.isArray(window.lastLeaderboardData)) {
        updateLeaderboardPopup(window.lastLeaderboardData);
    }
});

document.getElementById("my-badges").addEventListener("click", function () {
    const wrapper = document.querySelector("#my-badges-content .badge-grid");
    wrapper.innerHTML = "";

    if (Array.isArray(window.lastBadgesData)) {
        updateBadgesPopup(window.lastBadgesData);
    }
});

/* =========================
   INIT
   ========================= */
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
