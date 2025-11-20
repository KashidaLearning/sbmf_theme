const dataSource = window.coursePathData || [];
const numCircles = dataSource.length;

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

function createCircle(data, index) {
    const state = data.state || "locked";
    const stateInfo = STATE_CONFIG[state];

    const circleItem = document.createElement("div");
    circleItem.className = `circle-item circle-item--${state}`;

    const isSpecial = !!data.is_special;

   
    if (isSpecial) {
        circleItem.classList.add("circle-item--special-layout");

        circleItem.innerHTML = `
            <div class="circle-content">
                <div class="state-icon state-icon--${state}">
                    <img width="60px"  src="${stateInfo.icon}">
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
                    <img width="60px"  src="${stateInfo.icon}">
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

    const amplitude = Math.min(centerX - 120, 100);

    let y = 100 + (index * CONFIG.verticalSpacing);

    const patternIndex = index % CONFIG.positionPattern.length;
    const multiplier = CONFIG.positionPattern[patternIndex];

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

let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updatePositions, 120);
});

window.addEventListener("scroll", () => {
    updatePositions();
});

document.addEventListener("DOMContentLoaded", () => {
    initializeScene();
});
