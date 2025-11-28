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
    return window.innerWidth < 700 ? 60 : Math.min((window.innerWidth / 2) - 120, 100);
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
        element.style.top  = `${y}px`;
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

function renderLeaderboardInContainer(container, leaderboard) {
    if (!container) return;

    const currentUserId = window.CURRENT_USER_ID;
    let currentUserRank = null;
    let currentUserXp = 0;
    let currentUserProgress = 0;

    leaderboard.forEach((u, index) => {
        if (u.id === currentUserId) {
            currentUserRank = index + 1;
            currentUserXp = u.xp;
            currentUserProgress = u.progress;
        }
    });

    const rankSpan = container.querySelector(".lh-rank-title span");
    if (rankSpan && currentUserRank !== null) {
        rankSpan.textContent = "المرتبة " + currentUserRank;
    }

    const xpBold = container.querySelector(".lh-p b");
    if (xpBold && currentUserRank !== null) {
        xpBold.textContent = "XP " + currentUserXp;
    }

    const headerProgVal  = container.querySelector(".lh-progress-val");
    const headerProgFill = container.querySelector(".lh-progress-fill");
    if (currentUserRank !== null) {
        if (headerProgVal) {
            headerProgVal.textContent = currentUserProgress + "%";
        }
        if (headerProgFill) {
            headerProgFill.style.width = currentUserProgress + "%";
        }
    }

    container.querySelectorAll(".leaderboard-row").forEach(row => row.remove());

    leaderboard.forEach((u, index) => {
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
                    <div class="xp"><h4></h4></div>
                </div>
                <div class="pt1">XP <b>${u.xp}</b></div>
            </div>
        `;

        container.appendChild(row);
    });
}

function updateLeaderboardPopup(leaderboard) {
    const baseContainer = document.querySelector("#leaderboard-content .leaderboard");
    renderLeaderboardInContainer(baseContainer, leaderboard);

    const popupContainer = document.querySelector("#popup-dynamic-content .leaderboard");
    if (popupContainer) {
        renderLeaderboardInContainer(popupContainer, leaderboard);
    }
}

async function refreshCourseStatus() {
    try {
        const response = await fetch(window.location.pathname + "?ajax=1");
        const raw = await response.text();

        if (raw.trim().startsWith("<")) {
            return;
        }

        const data = JSON.parse(raw);

        if (data.coursePathDataJSON) {
            const parsed = JSON.parse(data.coursePathDataJSON);
            window.coursePathData = parsed.items;
            initializeScene();
            document.dispatchEvent(new Event("circlesRebuilt"));
        }

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

        if (Array.isArray(data.leaderboard)) {
            window.lastLeaderboardData = data.leaderboard;
            updateLeaderboardPopup(data.leaderboard);
        }

        if (data.eval) {
            updateEvalStatus(data.eval);
        }
    } catch (err) {}
}

const leaderboardIcon = document.getElementById("leaderboard");
if (leaderboardIcon) {
    leaderboardIcon.addEventListener("click", function () {
        if (Array.isArray(window.lastLeaderboardData)) {
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
