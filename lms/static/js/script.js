
const dataSource = window.coursePathData || [];
const numCircles = dataSource.length;

const CONFIG = {
    positionPattern: [0, -0.9, -1.5, -0.8, 0.3, 1, 0, 0],



   verticalSpacing: 200,
    specialVerticalSpacing: 120,

    initialActiveIndex: window.coursePathConfig?.initialActiveIndex ?? 0
};

let activeStepIndex = CONFIG.initialActiveIndex;
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

    // special layout comes from backend
    const isSpecial = !!data.is_special;

    if (isSpecial) {
        circleItem.classList.add("circle-item--special-layout");

        circleItem.innerHTML = `
            <div class="circle-content">
                <div class="state-icon state-icon--${state}">
                    <img width="45" src="${stateInfo.icon}">
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
                <div class="state-icon state-icon--${state}">
                    <img width="45" src="${stateInfo.icon}">
                </div>
                <div class="circle-image-wrapper">
                    <div class="circle-image-container2">
                        <img src="${data.icon}" class="circle-image">
                    </div>
                </div>
            </div>
            <div class="circle-text-block">
                <div class="circle-title">${data.title}</div>
                <div class="circle-description">${data.description || ""}</div>
            </div>
        `;
    }

 
    circleItem.addEventListener("click", () => {
        if (state === "locked") {
            // trigger your locked popup message
            document.body.dispatchEvent(new Event("lockedCourseClick"));
            return;
        }

        // open your real modal
        $('#courseFrame').attr('src', data.link);
        $('#courseModal').css('display', 'block');

        activeStepIndex = index;
        updateAllCircleStates();
    });

    circlesWrapper.appendChild(circleItem);

    circleElements.push({
        index: index,
        element: circleItem,
        isSpecial: isSpecial
    });
}


function calculatePosition(index, isSpecial) {
    const rect = circlesWrapper.getBoundingClientRect();
    const centerX = rect.width / 2;

    const amplitude = 150;

    let y = index * CONFIG.verticalSpacing;


    const patternIndex = index % CONFIG.positionPattern.length;
    const multiplier = CONFIG.positionPattern[patternIndex];
    const x = centerX + (multiplier * amplitude);

    return { x, y };
}


function updatePositions() {
    circleElements.forEach(({ index, element, isSpecial }) => {
        const { x, y } = calculatePosition(index, isSpecial);
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    });
}

function updateAllCircleStates() {
    circleElements.forEach(({ index, element }) => {
        element.classList.toggle("circle-item--active", index === activeStepIndex);
    });
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

    updateAllCircleStates();
    updatePositions();
}


window.addEventListener("scroll", () => {
    updatePositions();
});



document.addEventListener("DOMContentLoaded", () => {
    initializeScene();
});
