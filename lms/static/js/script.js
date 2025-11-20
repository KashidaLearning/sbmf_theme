let numCircles = 0;   // ← بدل const dataSource

const CONFIG = {
    positionPattern: [0, -1.5, -3, -1.5, 0, 1.5, 3, 1.5],
    verticalSpacing: 340,
    specialVerticalSpacing: 100,
};

let circleElements = [];

const circlesWrapper = document.getElementById("circlesWrapper");
if (!circlesWrapper) {
    console.error("❌ circlesWrapper not found");
}

const STATE_CONFIG = {
    completed: {
        icon: window.STATE_ICONS.completed,
        text: "Completed"
    },
    active: {
        icon: window.STATE_ICONS.active,
        text: "Active"
    },
    locked: {
        icon: window.STATE_ICONS.locked,
        text: "Locked"
    }
};

function getAmplitude() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 600) return 60;
    return Math.min((screenWidth / 2) - 120, 100);
}

function getVerticalSpacing() {
    return window.innerWidth < 600 ? 260 : CONFIG.verticalSpacing;
}

function getPatternMultiplier(base) {
    return window.innerWidth < 600 ? base / 2 : base;
}

function createCircle(data, index) {
    const state = data.state || "locked";
    const stateInfo = STATE_CONFIG[state];

    const circleItem = document.createElement("div");
    circleItem.className = `circle-item circle-item--${state}`;

    const isSpecial = !!data.is_special;
    const isFirst = data.is_first_course === true;
    const isCompleted = state === "completed";

    const iconToUse = (isFirst && isCompleted)
        ? window.FIRST_COMPLETED_BADGE
        : stateInfo.icon;

    if (isSpecial) {
        circleItem.classList.add("circle-item--special-layout");
        circleItem.innerHTML = `
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
        circleItem.innerHTML = `
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
                <div class="circle-description">${data.description || ""}</div>
            </div>
        `;
        if (state === "active") {
            circleItem.classList.add("circle-item--active");
        }
    }

    circleItem.addEventListener("click", () => {
        if (state === "locked") {
            document.body.dispatchEvent(new Event("lockedCourseClick"));
            return;
        }
        $('#courseFrame').attr('src', data.link);
        $('#courseModal').css('display', 'block');
    });

    circlesWrapper.appendChild(circleItem);

    circleElements.push({
        index: index,
        element: circleItem,
        isSpecial: isSpecial
    });
}

function calculatePosition(index) {
    const containerWidth = circlesWrapper.parentElement.offsetWidth;
    const centerX = containerWidth / 2;

    const amplitude = getAmplitude();

    let y = 100 + (index * getVerticalSpacing());
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
        element.style.transform = 'translate(-50%, -50%)';
    });
    updateContainerHeight();
}

const coursescontainer = document.getElementById('coursescontainer');

function updateContainerHeight() {
    if (circleElements.length > 0) {
        const lastPos = calculatePosition(circleElements.length - 1);
        coursescontainer.style.minHeight = `${lastPos.y + 120}px`;
    } else {
        coursescontainer.style.minHeight = `600px`;
    }
}

function initializeScene() {
    const dataSource = window.coursePathData || [];  // ← dynamic
    numCircles = dataSource.length;                  // ← update count

    if (!dataSource.length) {
        console.warn("⚠ No dataSource found");
        return;
    }

    circlesWrapper.innerHTML = "";
    circlesWrapper.style.setProperty("--path-items", dataSource.length);
    circleElements = [];

    dataSource.forEach((item, index) => {
        createCircle(item, index);
    });

    updatePositions();
}

async function refreshCourseStatus() {
    console.log("🔄 Refreshing course status...");

    try {
        const response = await fetch(window.location.pathname + "?ajax=1");
        const data = await response.json();

        if (data.coursePathDataJSON) {
            const parsed = JSON.parse(data.coursePathDataJSON);
            window.coursePathData = parsed.items;
            window.coursePathConfig.initialActiveIndex = parsed.initialActiveIndex;
        }

        initializeScene();

        if (data.progress_percent !== undefined) {
            document.querySelector(".lh-progress-fill-out").style.width =
                data.progress_percent + "%";

            document.querySelector(".lh-progress-val-out").textContent =
                data.progress_percent + "%";
        }

        if (data.badges_html) {
            const grid = document.querySelector("#my-badges-content .badge-grid");
            if (grid) grid.innerHTML = data.badges_html;
        }

        console.log(" Course UI updated successfully");

    } catch (err) {
        console.error(" Failed to refresh course status:", err);
    }
}

let scrollTimeout;
window.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updatePositions, 20);
});

document.addEventListener("DOMContentLoaded", () => {
    initializeScene();
});
