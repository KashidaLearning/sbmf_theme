let numCircles = 0;
let circleElements = [];

const circlesWrapper = document.getElementById("circlesWrapper");
const coursescontainer = document.getElementById("coursescontainer");

if (!circlesWrapper) {
    console.error(" circlesWrapper not found");
}

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

    const iconToUse = (isFirst && isCompleted)
        ? window.FIRST_COMPLETED_BADGE
        : STATE_CONFIG[state].icon;

    if (data.is_special) {
        circle.classList.add("circle-item--special-layout");
        circle.innerHTML = `
            <div class="circle-content">
                <div class="state-icon state-icon--${state}">
                    <img width="60px" src="${iconToUse}">
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
                    <img width="60px" src="${iconToUse}">
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

    // CLICK
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
    if (circleElements.length === 0) {
        coursescontainer.style.minHeight = "600px";
        return;
    }

    const last = calculatePosition(circleElements.length - 1);
    coursescontainer.style.minHeight = `${last.y + 120}px`;
}

function initializeScene() {
    const data = window.coursePathData || [];

    if (!data.length) return;

    numCircles = data.length;

    circlesWrapper.innerHTML = "";
    circleElements = [];

    data.forEach((item, index) => createCircle(item, index));
    updatePositions();
}


async function refreshCourseStatus() {
    console.log("Refreshing course status...");

    try {
        const response = await fetch(window.location.pathname + "?ajax=1");

        if (!response.ok) {
            console.error("Error from server:", response.status);
            return;
        }

        const raw = await response.text();

        if (raw.trim().startsWith("<")) {
            console.error(" HTML received instead of JSON");
            return;
        }

        let data = {};
        try {
            data = JSON.parse(raw);
        } catch (jsonErr) {
            console.error(" JSON error:", jsonErr);
            return;
        }

        if (data.coursePathDataJSON) {
            const parsed = JSON.parse(data.coursePathDataJSON);
            window.coursePathData = parsed.items;
            window.coursePathConfig = { initialActiveIndex: parsed.initialActiveIndex };
            initializeScene();
        }

        if (typeof data.progress_percent !== "undefined") {
            const bar = document.querySelector(".lh-progress-fill-out");
            if (bar) bar.style.width = `${data.progress_percent}%`;
        }

        if (data.badges) updateBadgesPopup(data.badges);

        if (data.leaderboard) updateLeaderboardPopup(data.leaderboard);

        console.log("UI updated successfully");

    } catch (err) {
        console.error("❌ refreshCourseStatus failed:", err);
    }
}


function rebindPopupTabs() {
    const popupContent = document.getElementById("popup-dynamic-content");

    if (!popupContent) return;

    popupContent.querySelectorAll(".icon-item-tab").forEach(tab => {
        tab.addEventListener("click", function () {
            const targetId = this.getAttribute("data-target");
            const contentDiv = document.getElementById(targetId);
            if (!contentDiv) return;

            popupContent.innerHTML =
                document.getElementById("popup-purple-icons-template").innerHTML +
                contentDiv.innerHTML;
        });
    });
}

function rebuildCircles() {
    console.log("Rebuilding circles path...");
    circlesWrapper.innerHTML = "";
    circleElements = [];
    initializeScene();
}


function updateBadgesPopup(badges) {
    const container = document.querySelector("#popup-dynamic-content .badge-grid");
    if (!container) return;

    container.innerHTML = "";

    badges.forEach(badge => {
        const div = document.createElement("div");
        div.className = "badge-item";

        div.innerHTML = `
            <img src="${badge.icon}" alt="${badge.title}">
        `;

        container.appendChild(div);
    });
}


function updateLeaderboardPopup(leaderboard) {
    const list = document.querySelector("#popup-leaderboard-users");
    if (list) {
        list.innerHTML = "";

        leaderboard.forEach((u, index) => {
            list.innerHTML += `
                <div class="leaderboard-user">
                    <div class="lb-rank">${index + 1}</div>
                    <div class="lb-name">${u.name}</div>
                    <div class="lb-progress-bar">
                        <div class="lb-progress-fill" style="width:${u.progress}%"></div>
                    </div>
                    <div class="lb-xp">${u.xp} XP</div>
                </div>
            `;
        });
    }
}


window.addEventListener("resize", updatePositions);

document.addEventListener("DOMContentLoaded", () => {
    initializeScene();
});

window.addEventListener("message", function(event) {
    if (!event.data) return;

    if (event.data.event === "progress" || event.data.event === "completion") {
        console.log("📢 iframe progress → UI refresh");
        refreshCourseStatus();
    }
});
