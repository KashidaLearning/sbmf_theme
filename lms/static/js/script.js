/***************************************************
 *  PATH UI — DYNAMIC FROM MAKO
 ***************************************************/

// Data injected from Mako template
const dataSource = window.coursePathData || [];
const numCircles = dataSource.length;

const CONFIG = {
    positionPattern: [0, -1, -1.6, -1, 0, 1, 1.6, 1],
   verticalSpacing: 140,
    specialVerticalSpacing: 100,
    initialActiveIndex: window.coursePathConfig?.initialActiveIndex ?? 0
};

let activeStepIndex = CONFIG.initialActiveIndex;
let circleElements = [];

const circlesWrapper = document.getElementById("circlesWrapper");
if (!circlesWrapper) {
    console.error("❌ circlesWrapper not found");
}


/***************************************************
 *  STATE CONFIGURATION
 ***************************************************/
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



/***************************************************
 *  CREATE CIRCLE
 ***************************************************/
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

    /***************************************************
     * CLICK LOGIC
     ***************************************************/
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


/***************************************************
 * POSITION CALCULATION
 ***************************************************/
function calculatePosition(index, isSpecial) {
    const rect = circlesWrapper.getBoundingClientRect();
    const centerX = rect.width / 2;

    const amplitude = 220;

    let y = isSpecial
        ? index * CONFIG.specialVerticalSpacing * 2
        : index * CONFIG.verticalSpacing;

    const patternIndex = index % CONFIG.positionPattern.length;
    const multiplier = CONFIG.positionPattern[patternIndex];
    const x = centerX + (multiplier * amplitude);

    return { x, y };
}


/***************************************************
 * UPDATE POSITIONS
 ***************************************************/
function updatePositions() {
    circleElements.forEach(({ index, element, isSpecial }) => {
        const { x, y } = calculatePosition(index, isSpecial);
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    });
}


/***************************************************
 * UPDATE STATES
 ***************************************************/
function updateAllCircleStates() {
    circleElements.forEach(({ index, element }) => {
        element.classList.toggle("circle-item--active", index === activeStepIndex);
    });
}


/***************************************************
 * INITIALIZE SCENE
 ***************************************************/
function initializeScene() {
    if (!dataSource.length) {
        console.warn("⚠ No dataSource found");
        return;
    }

    circlesWrapper.innerHTML = "";
    circleElements = [];

    dataSource.forEach((item, index) => {
        createCircle(item, index);
    });

    updateAllCircleStates();
    updatePositions();
}


/***************************************************
 * SCROLL LISTENER (OPTIONAL)
 ***************************************************/
window.addEventListener("scroll", () => {
    updatePositions();
});


/***************************************************
 * RUN AFTER LOAD
 ***************************************************/
document.addEventListener("DOMContentLoaded", () => {
    initializeScene();
});
