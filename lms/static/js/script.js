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
    active: { icon: window.STATE_ICONS.active },
    locked: { icon: window.STATE_ICONS.locked }
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

async function refreshCourseStatus() {
    try {
        const response = await fetch(window.location.pathname + "?ajax=1");
        const raw = await response.text();
        if (raw.trim().startsWith("<")) return;

        const data = JSON.parse(raw);

        if (data.coursePathDataJSON) {
            const parsed = JSON.parse(data.coursePathDataJSON);
            window.coursePathData = parsed.items;
            window.coursePathConfig = { initialActiveIndex: parsed.initialActiveIndex };
            initializeScene();
        }

        if (typeof data.progress_percent !== "undefined") {
            const barOut = document.querySelector(".lh-progress-fill-out");
            if (barOut) barOut.style.width = `${data.progress_percent}%`;
        }

        if (data.badges) updateBadgesPopup(data.badges);
        if (data.leaderboard) updateLeaderboardPopup(data.leaderboard);

        rebindPopupTabs();
    } catch (err) {}
}

function rebuildCircles() {
    if (!circlesWrapper) return;
    circlesWrapper.innerHTML = "";
    circleElements = [];
    initializeScene();
}

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
    const wrapper = document.querySelector("#leaderboard-content");
    if (!wrapper) return;

    wrapper.querySelectorAll(".leaderboard-row").forEach(el => el.remove());
    const noBadge = wrapper.querySelector(".no-badge");
    if (noBadge) noBadge.remove();

    leaderboard.forEach((u, index) => {
        const row = document.createElement("div");
        row.className = "leaderboard-row";
        row.innerHTML = `
            <div class="lb-rank">${index + 1}</div>
            <div class="lb-name">${u.name}</div>
            <div class="lb-progress">
                <div class="lb-progress-fill" style="width:${u.progress}%"></div>
            </div>
            <div class="lb-xp">${u.xp} XP</div>
        `;
        wrapper.appendChild(row);
    });
}

window.addEventListener("resize", () => {
    if (!circleElements.length) return;
    updatePositions();
});

document.addEventListener("DOMContentLoaded", () => {
    initializeScene();
});

window.addEventListener("message", function(event) {
    if (!event.data) return;
    if (event.data.event === "progress" || event.data.event === "completion") {
        refreshCourseStatus();
    }
});
