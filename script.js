// Carica i dati dei progetti dal file JSON
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const data = await response.json();
        return data.projects;
    } catch (error) {
        console.error('Errore nel caricamento dei progetti:', error);
        return [];
    }
}

const centralMediaOrder = [
    'radio_1.webp',
    'tesi_2.webp',
    'metamorfosi1.gif',
    'gurz_1b.webp',
    'gurz_2.webp',
    'gurz_3.webp',
    'gurz_4.mp4',
    'gurz_5.webp',
    'gurz_6.webp',
    'gurz_video7.mp4',
    'dimitri_0.webp',
    'dimitri_1.webp',
    'dimitri_2.webp',
    'dimitri_3.webp',
    'dimitri_3b.webp',
    'dimitri_4.webp',
    'dimitri_5.webp',
    'dimitri_6.webp',
    'tesi_3.webp',
    'casetta_0.webp',
    'AGF_1.webp',
    'AGF_2.webp',
    'AGF_graficaitaliana3.webp',
    'AGF_graficaitaliana4.webp',
    'AGF_graficaitaliana5.webp',
    'AGF_graficaitaliana6.webp',
    'AGF_graficaitaliana7.webp',
    'AGF_graficaitaliana8.webp',
    'AGF_graficaitaliana9.webp',
    'AGF_graficaitaliana10.webp',
    'AGF_graficaitaliana11.webp',
    'tesi_2b.webp',
    'tesi_1 copy.webp',
    'radio_7.webp',
    'radio_6.webp',
    'casetta_1.webp',
    'casetta_1b.webp',
    'casetta_2.webp',
    'casetta_b.webp',
    'casetta_bb.webp',
    'casetta_c.webp',
    'radio_book_1.webp',
    'radio_3.webp',
    'font_3.webp',
    'radio_5.webp',
    'tesi_4.webp',
    'polano_2.webp',
    'radio_book_2.webp',
    'deviante_1.webp',
    'deviante_2.gif',
    'deviante_3.webp',
    'deviante_4.webp',
    'deviante_5.webp',
    'gurz_5.webp',
    'tesi_1.webp',
    'tesi_1b.webp',
    'font_2.webp'
];

const landingRandomMedia = [
    'images/LANDING/IMG_3428.webp',
    'images/LANDING/anatre.webp',
    'images/LANDING/arcobaleno.webp',
    'images/LANDING/arcobaleno_2.webp',
    'images/LANDING/biennale.webp',
    'images/LANDING/biennale_1.webp',
    'images/LANDING/biennale_2.webp',
    'images/LANDING/crusc8.webp',
    'images/LANDING/fiore.webp',
    'images/LANDING/giostre.webp',
    'images/LANDING/libro-telo.webp',
    'images/LANDING/mercatino_1.webp',
    'images/LANDING/mercatino_2.webp',
    'images/LANDING/mercatino_3.webp',
    'images/LANDING/mercatino_4.webp',
    'images/LANDING/neve.webp',
    'images/LANDING/palloncini.webp',
    'images/LANDING/peluche.webp',
    'images/LANDING/prato.webp',
    'images/LANDING/pratofiori.webp',
    'images/LANDING/ringhiera.webp',
    'images/LANDING/sedile.webp',
    'images/LANDING/simbolo.webp',
    'images/LANDING/soffitto.webp',
    'images/LANDING/sole.webp',
    'images/LANDING/stagno.webp',
    'images/LANDING/strada.webp',
    'images/LANDING/tavolo_1.webp',
    'images/LANDING/tavolo_2.webp',
    'images/LANDING/tavolo_3.webp',
    'images/LANDING/telo_1.webp',
    'images/LANDING/telo_2.webp',
    'images/LANDING/telo_3.webp',
    'images/LANDING/telo_4.webp',
    'images/LANDING/vetrina.webp',
    'images/LANDING/vinile_1.webp',
    'images/LANDING/vinile_2.webp',
    'images/LANDING/volante.png'
];

function hasAllowedExtension(path) {
    return /\.(webp|png|jpe?g|gif|mp4)$/i.test(path || '');
}

function getMediaFileName(path) {
    return (path || '').split('/').pop();
}

const mobileViewport = window.matchMedia('(max-width: 900px)');

let lastSelectedProjectIndex = null;
let activeProjectIndex = null;
let scrollSyncLockedUntil = 0;
let hasPendingManualSelection = false;
let manualSelectionTargetIndex = null;
let manualSelectionScrollTimer = null;
let landingRandomMediaPool = [];
let landingRandomPlacementPool = [];
let landingRandomTimer = null;

function getProjectMediaElements(projectIndex) {
    return Array.from(document.querySelectorAll(`#images-container [data-project-index="${projectIndex}"]`));
}

function getOrderedProjectMediaElements(projectIndex) {
    return getProjectMediaElements(projectIndex).sort((a, b) => {
        const indexA = Number(a.dataset.projectImageIndex ?? 0);
        const indexB = Number(b.dataset.projectImageIndex ?? 0);
        return indexA - indexB;
    });
}

function isMobileView() {
    return mobileViewport.matches;
}

function getRandomItem(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }

    return items[Math.floor(Math.random() * items.length)];
}

function shuffleItems(items) {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
}

function getNextLandingRandomMedia() {
    if (landingRandomMediaPool.length === 0) {
        landingRandomMediaPool = shuffleItems(landingRandomMedia);
    }

    return landingRandomMediaPool.pop() || null;
}

function getLandingPlacementAnchors() {
    const anchors = [];
    const xPositions = [8, 26, 44, 62, 80];
    const yPositions = [10, 28, 46, 64, 82];

    yPositions.forEach(y => {
        xPositions.forEach(x => {
            anchors.push({ x, y });
        });
    });

    return anchors;
}

function getNextLandingPlacement() {
    if (landingRandomPlacementPool.length === 0) {
        landingRandomPlacementPool = shuffleItems(getLandingPlacementAnchors());
    }

    return landingRandomPlacementPool.pop() || { x: 50, y: 50 };
}

function normalizeVisibleLineBreaks(text) {
    return String(text || '')
        .replace(/\r\n/g, '\n')
        .replace(/\n[ \t]*\n+/g, '\n')
        .trim();
}

function splitDescriptionText(rawDescription) {
    const description = normalizeVisibleLineBreaks(rawDescription);
    if (!description) {
        return { main: '', last: '' };
    }

    const paragraphs = description
        .split('\n')
        .map(block => block.trim())
        .filter(Boolean);

    if (paragraphs.length >= 2) {
        const last = paragraphs.pop();
        return {
            main: paragraphs.join('\n'),
            last
        };
    }

    const singleBlock = paragraphs[0] || description;
    const sentences = singleBlock.split(/(?<=[.!?])\s+/).filter(Boolean);

    if (sentences.length >= 2) {
        const last = sentences.pop();
        return {
            main: sentences.join(' '),
            last
        };
    }

    return { main: '', last: singleBlock };
}

function shouldSplitDescription(projectTitle) {
    return ![
        'Ci sono muri troppo alti per te',
        '10JA Exhibition – Dimitri Bähler',
        'Mapping Body'
    ].includes(projectTitle);
}

function setDescriptionContent(prefix, descriptionText, projectTitle = '') {
    const mainElement = document.getElementById(`${prefix}-main`);
    const lastElement = document.getElementById(`${prefix}-last`);
    const descriptionContainer = document.getElementById(prefix);

    if (!mainElement || !lastElement || !descriptionContainer) {
        return;
    }

    if (!shouldSplitDescription(projectTitle)) {
        descriptionContainer.classList.remove('align-last-bottom');
        mainElement.textContent = normalizeVisibleLineBreaks(descriptionText);
        lastElement.textContent = '';
        return;
    }

    descriptionContainer.classList.add('align-last-bottom');
    const { main, last } = splitDescriptionText(descriptionText);
    mainElement.textContent = main;
    lastElement.textContent = last;
}

function getLandingDescriptionText() {
    const paragraphs = Array.from(document.querySelectorAll('#landing-description > *'))
        .map(element => element.textContent.trim())
        .filter(Boolean);

    return paragraphs.join('\n');
}

function setLandingDescriptionContent(prefix) {
    const container = document.getElementById(prefix);
    const source = document.getElementById('landing-description');

    if (!container || !source) {
        return false;
    }

    container.innerHTML = source.innerHTML;
    return true;
}

function clearMobileProjectMedia() {
    const mediaContainer = document.getElementById('mobile-project-media');

    if (mediaContainer) {
        mediaContainer.innerHTML = '';
    }
}

function createMediaElement(source, altText = '') {
    let element;

    if (source.endsWith('.mp4') || source.endsWith('.webm') || source.endsWith('.ogg')) {
        element = document.createElement('video');
        element.src = source;
        element.controls = true;
        element.muted = true;
        element.playsInline = true;
        element.preload = 'metadata';
        element.loop = true;
        element.autoplay = true;
    } else {
        element = document.createElement('img');
        element.src = source;
        element.alt = altText;
        element.loading = 'lazy';
    }

    return element;
}

function renderMobileProjectMedia(project = {}) {
    const mediaContainer = document.getElementById('mobile-project-media');

    if (!mediaContainer) {
        return false;
    }

    mediaContainer.innerHTML = '';

    (project.images || []).forEach(source => {
        if (!hasAllowedExtension(source)) {
            return;
        }

        mediaContainer.appendChild(createMediaElement(source, project.title ? `Immagine per ${project.title}` : ''));
    });

    return mediaContainer.children.length > 0;
}

function shouldUseLightMobileClose(title = '') {
    return ['Aradia', 'Deviante', 'Metamorfosi'].includes(title);
}

function openMobileProjectOverlay(content = {}) {
    const overlay = document.getElementById('mobile-project-overlay');
    const title = document.getElementById('mobile-project-title');
    const closeButton = document.getElementById('mobile-overlay-close');

    if (!overlay || !title) {
        return;
    }

    const {
        title: overlayTitle = '',
        description = '',
        colorTheme = 'default',
        showMedia = false
    } = content;

    clearMobileProjectMedia();
    title.textContent = overlayTitle;
    title.hidden = !overlayTitle || showMedia;

    if (colorTheme === 'landing' && setLandingDescriptionContent('mobile-project-description')) {
        overlay.classList.toggle('is-landing-copy', true);
    } else {
        setDescriptionContent('mobile-project-description', description, overlayTitle);
        overlay.classList.toggle('is-landing-copy', colorTheme === 'landing');
    }

    overlay.classList.toggle('is-project-sheet', showMedia);
    overlay.classList.toggle('has-light-close', showMedia && shouldUseLightMobileClose(overlayTitle));

    if (showMedia) {
        renderMobileProjectMedia(content);
    }

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    if (closeButton) {
        closeButton.hidden = false;
    }
    document.body.classList.add('mobile-overlay-open');
    overlay.scrollTop = 0;
}

function closeMobileProjectOverlay() {
    const overlay = document.getElementById('mobile-project-overlay');
    const closeButton = document.getElementById('mobile-overlay-close');

    if (!overlay) {
        return;
    }

    overlay.classList.remove('is-open');
    overlay.classList.remove('is-landing-copy');
    overlay.classList.remove('is-project-sheet');
    overlay.classList.remove('has-light-close');
    overlay.setAttribute('aria-hidden', 'true');
    if (closeButton) {
        closeButton.hidden = true;
    }
    document.body.classList.remove('mobile-overlay-open');
    clearMobileProjectMedia();
}

function normalizeProjectLabel(label) {
    return String(label || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '')
        .toLowerCase();
}

function matchProjectIndex(projects, titleOrLabels) {
    const labels = Array.isArray(titleOrLabels) ? titleOrLabels : [titleOrLabels];
    const normalizedLabels = labels
        .map(label => normalizeProjectLabel(label))
        .filter(Boolean);

    return projects.findIndex(project => {
        const projectLabel = normalizeProjectLabel(project.title);

        return normalizedLabels.some(label => {
            return projectLabel === label
                || projectLabel.startsWith(label)
                || label.startsWith(projectLabel)
                || projectLabel.includes(label)
                || label.includes(projectLabel);
        });
    });
}

function getLandingMenuLines() {
    const list = document.getElementById('mobile-landing-list');

    if (!list) {
        return [];
    }

    return list.textContent.split('\n').map(line => line.trim()).filter(Boolean);
}

function findProjectForMenuLine(line, projects) {
    const lineLabel = normalizeProjectLabel(line);
    if (!lineLabel || lineLabel.length <= 1) {
        return null;
    }

    const exactMatch = projects
        .map((project, index) => ({ project, index }))
        .find(item => normalizeProjectLabel(item.project.title) === lineLabel);

    if (exactMatch) {
        return exactMatch;
    }

    if (lineLabel.length <= 3) {
        return null;
    }

    return projects
        .map((project, index) => ({ project, index }))
        .find(item => {
            const titleLabel = normalizeProjectLabel(item.project.title);
            return titleLabel.startsWith(lineLabel)
                || lineLabel.startsWith(titleLabel)
                || (lineLabel.length > 6 && titleLabel.includes(lineLabel))
                || (titleLabel.length > 6 && lineLabel.includes(titleLabel));
        }) || null;
}

function bindMobileLandingProjects(projects, lines = getLandingMenuLines()) {
    const list = document.getElementById('mobile-landing-list');

    if (!list) {
        return;
    }

    list.innerHTML = '';

    lines.forEach(line => {
        const match = findProjectForMenuLine(line, projects);
        const element = document.createElement(match ? 'button' : 'span');

        element.className = match ? 'mobile-landing-project' : 'mobile-landing-text';
        element.textContent = line;

        if (match) {
            element.type = 'button';
            element.addEventListener('click', () => {
                if (!isMobileView()) {
                    return;
                }

                openMobileProjectOverlay({
                    ...match.project,
                    showMedia: true
                });
            });
        }

        list.appendChild(element);
    });
}

function populateAboutSections() {
    const aboutCopy = document.getElementById('about-copy');
    const mobileAboutCopy = document.getElementById('mobile-about-copy');
    const aboutExperiences = document.getElementById('about-experiences');
    const mobileAboutExperiences = document.getElementById('mobile-about-experiences');

    if (aboutCopy && mobileAboutCopy) {
        mobileAboutCopy.innerHTML = aboutCopy.innerHTML;
    }

    if (aboutExperiences && mobileAboutExperiences) {
        mobileAboutExperiences.innerHTML = aboutExperiences.innerHTML;
    }
}

function bindMobileOverlayEvents(projects, lines) {
    const closeButton = document.getElementById('mobile-overlay-close');
    const mobileAboutButton = document.getElementById('mobile-about-button');

    bindMobileLandingProjects(projects, lines);

    if (closeButton) {
        closeButton.addEventListener('click', closeMobileProjectOverlay);
    }

    if (mobileAboutButton) {
        mobileAboutButton.addEventListener('click', () => {
            if (!isMobileView()) {
                return;
            }

            openMobileProjectOverlay({
                description: getLandingDescriptionText(),
                colorTheme: 'landing'
            });
        });
    }

    mobileViewport.addEventListener('change', event => {
        if (!event.matches) {
            closeMobileProjectOverlay();
        }
    });
}

function bindMobileTopTapScroll() {
    document.addEventListener('click', event => {
        if (!isMobileView() || event.clientY > 48) {
            return;
        }

        if (event.clientX > window.innerWidth - 72) {
            return;
        }

        if (event.target.closest('a, button')) {
            return;
        }

        const openOverlay = document.querySelector('#mobile-project-overlay.is-open');
        if (!openOverlay && event.target.closest('.mobile-landing-project')) {
            return;
        }

        const scrollTarget = openOverlay || document.getElementById('images-column');

        if (scrollTarget) {
            scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// Funzioni per la landing page
function showLandingPage() {
    const imagesColumn = document.getElementById('images-column');
    resetProjectFocusOrder();
    clearLandingRandomImages();
    hasPendingManualSelection = false;
    document.body.classList.remove('desktop-about-active');
    document.body.classList.add('landing-active');
    if (imagesColumn) {
        imagesColumn.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.querySelectorAll('#projects-list li').forEach(li => li.classList.remove('active'));
    activeProjectIndex = null;
    lastSelectedProjectIndex = null;
}

function hideLandingPage() {
    document.body.classList.remove('landing-active');
    document.body.classList.remove('desktop-about-active');
    stopLandingRandomSequence();
}

function showDesktopAbout() {
    if (isMobileView()) {
        showLandingPage();
        return;
    }

    const imagesColumn = document.getElementById('images-column');
    resetProjectFocusOrder();
    hasPendingManualSelection = false;
    clearLandingRandomImages();
    document.body.classList.remove('landing-active');
    document.body.classList.add('desktop-about-active');
    document.querySelectorAll('#projects-list li').forEach(li => li.classList.remove('active'));
    activeProjectIndex = null;
    lastSelectedProjectIndex = null;

    if (imagesColumn) {
        imagesColumn.scrollTo({ top: 0 });
    }

    startLandingRandomSequence();
}

function resetProjectFocusOrder() {
    document.querySelectorAll('#images-container > img, #images-container > video').forEach(element => {
        element.style.order = '';
    });
}

function getCurrentVisibleMediaElement(mediaElements, columnTop) {
    return mediaElements.reduce((currentElement, element) => {
        const rect = element.getBoundingClientRect();

        if (rect.bottom <= columnTop) {
            return currentElement;
        }

        if (!currentElement) {
            return element;
        }

        const currentRect = currentElement.getBoundingClientRect();
        const currentDistance = Math.max(0, currentRect.top - columnTop);
        const elementDistance = Math.max(0, rect.top - columnTop);

        return elementDistance < currentDistance ? element : currentElement;
    }, null);
}

function bindLogoEvents() {
    const logoLink = document.getElementById('logo-link');
    const mobileLogoButton = document.getElementById('mobile-logo-button');
    const landingRandomClear = document.getElementById('landing-random-clear');

    if (logoLink) {
        logoLink.addEventListener('click', showDesktopAbout);
    }

    if (mobileLogoButton) {
        mobileLogoButton.addEventListener('click', showLandingPage);
    }

    if (landingRandomClear) {
        landingRandomClear.addEventListener('click', clearLandingRandomImages);
    }
}

function clearLandingRandomImages() {
    const container = document.getElementById('landing-random-images');
    stopLandingRandomSequence();
    landingRandomMediaPool = [];
    document.body.classList.remove('landing-random-has-images');

    if (!container) {
        return;
    }

    container.innerHTML = '';
    landingRandomPlacementPool = [];
}

function prepareLandingRandomCycle(container) {
    if (landingRandomMediaPool.length > 0) {
        return;
    }

    if (container.children.length > 0) {
        container.innerHTML = '';
        landingRandomPlacementPool = [];
        document.body.classList.remove('landing-random-has-images');
    }

    landingRandomMediaPool = shuffleItems(landingRandomMedia);
}

function stopLandingRandomSequence() {
    if (!landingRandomTimer) {
        return;
    }

    window.clearTimeout(landingRandomTimer);
    landingRandomTimer = null;
}

function startLandingRandomSequence() {
    stopLandingRandomSequence();

    if (isMobileView()) {
        return;
    }

    const scheduleNextImage = () => {
        if (!document.body.classList.contains('desktop-about-active')) {
            landingRandomTimer = null;
            return;
        }

        createRandomLandingImage();
        const nextDelay = 900 + Math.random() * 1300;
        landingRandomTimer = window.setTimeout(scheduleNextImage, nextDelay);
    };

    landingRandomTimer = window.setTimeout(scheduleNextImage, 250);
}

function createRandomLandingImage() {
    const container = document.getElementById('landing-random-images');
    const landingPage = document.getElementById('landing-page');

    if (!container || !landingPage) {
        return;
    }

    prepareLandingRandomCycle(container);
    const source = getNextLandingRandomMedia();

    if (!source) {
        return;
    }

    const mobileSizeMultiplier = 1.7;
    const desktopFormatOptions = [
        { width: [28.8, 43.2], ratio: [0.72, 0.9] },
        { width: [32.4, 50.4], ratio: [1.2, 1.55] },
        { width: [25.2, 36], ratio: [0.95, 1.05] },
        { width: [46.8, 64.8], ratio: [1.45, 1.8] }
    ];
    const formatOptions = isMobileView()
        ? desktopFormatOptions.map(option => ({
            width: [
                option.width[0] * mobileSizeMultiplier,
                option.width[1] * mobileSizeMultiplier
            ],
            ratio: option.ratio
        }))
        : desktopFormatOptions;
    const chosenFormat = getRandomItem(formatOptions);

    if (!chosenFormat) {
        return;
    }

    const image = document.createElement('img');
    const width = chosenFormat.width[0] + Math.random() * (chosenFormat.width[1] - chosenFormat.width[0]);
    const ratio = chosenFormat.ratio[0] + Math.random() * (chosenFormat.ratio[1] - chosenFormat.ratio[0]);
    const height = width / ratio;
    const minLeft = Math.min(0, 100 - width);
    const minTop = Math.min(0, 100 - height);
    const anchor = getNextLandingPlacement();
    const jitterX = (Math.random() * 12) - 6;
    const jitterY = (Math.random() * 12) - 6;
    const unclampedLeft = anchor.x + jitterX - (width / 2);
    const unclampedTop = anchor.y + jitterY - (height / 2);
    const left = Math.max(minLeft, Math.min(100, unclampedLeft));
    const top = Math.max(minTop, Math.min(100, unclampedTop));

    image.src = source;
    image.alt = '';
    image.className = 'landing-random-image';
    image.style.width = `${width}%`;
    image.style.aspectRatio = `${ratio}`;
    image.style.left = `${left}%`;
    image.style.top = `${top}%`;
    image.style.setProperty('--landing-random-rotation', `${(Math.random() * 20) - 10}deg`);

    container.appendChild(image);
    document.body.classList.add('landing-random-has-images');
}

function hasFirstProjectMediaReachedHeader() {
    const imagesColumn = document.getElementById('images-column');
    const firstProjectMedia = document.querySelector('#images-container [data-project-index]');

    if (!imagesColumn || !firstProjectMedia) {
        return false;
    }

    const columnTop = imagesColumn.getBoundingClientRect().top;
    const firstMediaTop = firstProjectMedia.getBoundingClientRect().top;

    return firstMediaTop <= columnTop;
}

function bindLandingRandomImages() {
    const imagesColumn = document.getElementById('images-column');
    const mobileLogoButton = document.getElementById('mobile-logo-button');
    const mobileAboutButton = document.getElementById('mobile-about-button');

    if (!imagesColumn) {
        return;
    }

    const handleLandingPointerStart = event => {
        if (!document.body.classList.contains('landing-active')) {
            return;
        }

        if (document.body.classList.contains('mobile-overlay-open')) {
            return;
        }

        if (
            mobileLogoButton?.contains(event.target)
            || mobileAboutButton?.contains(event.target)
        ) {
            return;
        }

        createRandomLandingImage();
    };

    document.addEventListener('pointerdown', handleLandingPointerStart, { passive: true });

    imagesColumn.addEventListener('scroll', () => {
        if (document.body.classList.contains('desktop-about-active')) {
            return;
        }

        const landingPage = document.getElementById('landing-page');
        const landingHeight = landingPage ? landingPage.offsetHeight : 0;
        const hasLeftLanding = landingHeight > 0 && imagesColumn.scrollTop >= landingHeight * 0.5;

        if (hasLeftLanding || hasFirstProjectMediaReachedHeader()) {
            clearLandingRandomImages();
        }
    });
}

function getSpecifiedProjectOrder(projects) {
    const desiredTitles = [
        'AG Fronzoni. Il progetto tra bianco e nero',
        'Aradia',
        'Ci sono muri troppo alti per te',
        'Come fare tipografia svizzera?',
        'Deviante',
        'Mapping Body',
        'Metamorfosi',
        'radio spugna',
        'Terrain Gurzelen Vol. 1',
        ['The trompette à manège plays again…', 'the trompette à manège plays again...'],
        ['What’s the opposite of precarity?', 'What’s the opposite of precarity? Progettualità condivise e collettività istantanee'],
        '10JA Exhibition – Dimitri Bähler'
    ];

    return desiredTitles
        .map(title => matchProjectIndex(projects, title))
        .filter(index => index >= 0);
}

function populateProjectsList(projects, lines = getLandingMenuLines()) {
    const projectsList = document.getElementById('projects-list');
    projectsList.innerHTML = '';

    const orderedProjectIndexes = [];

    lines.forEach(line => {
        const match = findProjectForMenuLine(line, projects);
        const li = document.createElement('li');

        if (match) {
            orderedProjectIndexes.push(match.index);
            li.dataset.index = match.index;

            const titleSpan = document.createElement('button');
            titleSpan.type = 'button';
            titleSpan.className = 'project-item-title';
            titleSpan.textContent = line;
            titleSpan.addEventListener('click', event => {
                event.stopPropagation();
                selectProject(match.index, projects);
            });
            li.appendChild(titleSpan);
        } else {
            li.className = 'project-list-marker';
            li.textContent = line;
        }

        projectsList.appendChild(li);
    });

    return orderedProjectIndexes;
}

function setInitialDesktopProject(projects) {
    if (isMobileView()) {
        return;
    }

    const firstProjectMedia = document.querySelector('#images-container [data-project-index]');

    if (firstProjectMedia) {
        updateActiveProject(Number(firstProjectMedia.dataset.projectIndex), projects);
    }
}

// Popola tutte le immagini nella colonna centrale
function populateImages(projects, orderedProjectIndexes = []) {
    const imagesContainer = document.getElementById('images-container');
    imagesContainer.innerHTML = '';

    const projectSequence = Array.isArray(orderedProjectIndexes) && orderedProjectIndexes.length > 0
        ? orderedProjectIndexes
        : projects.map((_, index) => index);

    projectSequence.forEach(projectIndex => {
        const project = projects[projectIndex];

        if (!project) {
            return;
        }

        (project.images || []).forEach((imageSrc, imageIndex) => {
            if (!hasAllowedExtension(imageSrc)) {
                return;
            }

            let element;
            if (imageSrc.endsWith('.mp4') || imageSrc.endsWith('.webm') || imageSrc.endsWith('.ogg')) {
                element = document.createElement('video');
                element.src = imageSrc;
                element.controls = false;
                element.muted = true;
                element.loop = true;
                element.autoplay = true;
                element.playsInline = true;
            } else {
                element = document.createElement('img');
                element.src = imageSrc;
                element.alt = project.title ? `Immagine per ${project.title}` : `Immagine ${getMediaFileName(imageSrc)}`;
            }

            element.dataset.projectIndex = projectIndex;
            element.dataset.projectImageIndex = imageIndex;
            element.dataset.originalOrder = imageIndex;
            element.addEventListener('click', () => {
                if (isMobileView()) {
                    openMobileProjectOverlay(projects[projectIndex]);
                    return;
                }

                selectProject(projectIndex, projects, element);
            });

            imagesContainer.appendChild(element);
        });
    });
}

function scrollProjectToTop(index, clickedElement = null) {
    const imagesColumn = document.getElementById('images-column');
    const imagesContainer = document.getElementById('images-container');
    const targetElement = clickedElement || document.querySelector(`#images-container [data-project-index="${index}"]`);

    if (!imagesColumn || !imagesContainer || !targetElement) {
        return;
    }

    const targetOffset = targetElement.offsetTop;
    imagesColumn.scrollTo({
        top: targetOffset,
        behavior: 'smooth'
    });
}

function temporarilySuppressScrollSync(durationMs = 1200) {
    scrollSyncLockedUntil = Date.now() + durationMs;
}

function setManualSelectionLock(targetIndex) {
    hasPendingManualSelection = true;
    manualSelectionTargetIndex = targetIndex;

    if (manualSelectionScrollTimer) {
        clearTimeout(manualSelectionScrollTimer);
    }

    manualSelectionScrollTimer = setTimeout(() => {
        hasPendingManualSelection = false;
        manualSelectionTargetIndex = null;
        manualSelectionScrollTimer = null;
        scrollSyncLockedUntil = Date.now();
    }, 1000);
}

function updateActiveProject(index, projects) {
    const project = projects[index];

    if (!project) {
        return;
    }

    document.querySelectorAll('#projects-list li').forEach(li => {
        li.classList.remove('active');
        li.style.color = '';
        const titleElement = li.querySelector('.project-item-title');
        if (titleElement) {
            titleElement.style.color = '';
        }
    });

    const activeItem = document.querySelector(`#projects-list li[data-index="${index}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        const titleElement = activeItem.querySelector('.project-item-title');
        if (titleElement) {
            titleElement.style.color = '#000000';
        }
    }

    const titleElement = document.getElementById('project-title');
    if (titleElement) {
        titleElement.textContent = project.title;
    }

    setDescriptionContent('project-description', project.description, project.title || '');
    activeProjectIndex = index;
}

function activateProject(index, projects, clickedElement = null) {
    hideLandingPage();
    clearLandingRandomImages();
    setManualSelectionLock(index);
    temporarilySuppressScrollSync();
    updateActiveProject(index, projects);
    scrollProjectToTop(index, clickedElement);
    lastSelectedProjectIndex = index;
}

function syncProjectWithScroll(projects) {
    const imagesColumn = document.getElementById('images-column');
    const mediaElements = Array.from(document.querySelectorAll('#images-container [data-project-index]'));

    if (!imagesColumn || mediaElements.length === 0) {
        return;
    }

    let ticking = false;

    const projectOrder = getSpecifiedProjectOrder(projects);

    const updateFromScroll = () => {
        if (Date.now() >= scrollSyncLockedUntil && hasPendingManualSelection) {
            hasPendingManualSelection = false;
        }

        if (Date.now() < scrollSyncLockedUntil || hasPendingManualSelection) {
            ticking = false;
            return;
        }

        const landingPage = document.getElementById('landing-page');
        const landingHeight = landingPage ? landingPage.offsetHeight : 0;
        const landingExitPoint = isMobileView() ? landingHeight : landingHeight * 0.5;

        if (imagesColumn.scrollTop < landingExitPoint) {
            if (!document.body.classList.contains('landing-active')) {
                document.body.classList.add('landing-active');
                document.querySelectorAll('#projects-list li').forEach(li => li.classList.remove('active'));
                activeProjectIndex = null;
                lastSelectedProjectIndex = null;
            }
            ticking = false;
            return;
        }

        document.body.classList.remove('landing-active');

        const columnTop = imagesColumn.getBoundingClientRect().top;
        const currentElement = getCurrentVisibleMediaElement(mediaElements, columnTop);

        if (currentElement) {
            const currentProjectIndex = Number(currentElement.dataset.projectIndex);
            const currentOrderIndex = projectOrder.indexOf(currentProjectIndex);

            if (manualSelectionTargetIndex !== null) {
                if (currentProjectIndex === manualSelectionTargetIndex) {
                    manualSelectionTargetIndex = null;
                    hasPendingManualSelection = false;
                } else {
                    ticking = false;
                    return;
                }
            }

            if (currentOrderIndex >= 0) {
                if (currentProjectIndex !== activeProjectIndex) {
                    updateActiveProject(currentProjectIndex, projects);
                }
            }
        }

        ticking = false;
    };

    imagesColumn.addEventListener('scroll', () => {
        if (hasPendingManualSelection) {
            if (manualSelectionScrollTimer) {
                clearTimeout(manualSelectionScrollTimer);
            }

            manualSelectionScrollTimer = setTimeout(() => {
                hasPendingManualSelection = false;
                manualSelectionScrollTimer = null;
                scrollSyncLockedUntil = Date.now();
            }, 600);
        }

        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(updateFromScroll);
    });
}

// Gestisce la selezione di un progetto
function selectProject(index, projects, clickedElement = null) {
    const projectMediaElements = getProjectMediaElements(index);
    const targetElement = clickedElement || projectMediaElements[0] || null;
    activateProject(index, projects, targetElement);
}

function pauseAndMuteVideo(video) {
    if (!video) {
        return;
    }

    video.pause();
    video.muted = true;
}

async function playVideoWithSound(video) {
    if (!video) {
        return;
    }

    // Ferma eventuali altri video attivi prima di avviarne uno nuovo.
    document.querySelectorAll('#images-container video').forEach(otherVideo => {
        if (otherVideo !== video) {
            pauseAndMuteVideo(otherVideo);
        }
    });

    video.currentTime = video.currentTime || 0;
    video.muted = false;

    try {
        await video.play();
    } catch (error) {
        // Fallback per browser che bloccano autoplay con audio senza interazione utente.
        video.muted = true;

        try {
            await video.play();
        } catch (_) {
            pauseAndMuteVideo(video);
        }
    }
}

function bindScrollActivatedVideos() {
    const imagesColumn = document.getElementById('images-column');
    const videos = document.querySelectorAll('#images-container video');

    if (!imagesColumn || videos.length === 0) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;

            if (entry.isIntersecting) {
                playVideoWithSound(video);
            } else {
                pauseAndMuteVideo(video);
            }
        });
    }, {
        root: imagesColumn,
        threshold: 0.6
    });

    videos.forEach(video => {
        video.playsInline = true;
        video.preload = 'metadata';
        observer.observe(video);
    });
}

// Inizializza il sito
async function init() {
    const projects = await loadProjects();
    if (projects.length > 0) {
        const landingMenuLines = getLandingMenuLines();
        bindMobileOverlayEvents(projects, landingMenuLines);
        bindMobileTopTapScroll();
        bindLogoEvents();
        bindLandingRandomImages();
        populateAboutSections();
        populateProjectsList(projects, landingMenuLines);
        populateImages(projects, getSpecifiedProjectOrder(projects));
        if (isMobileView()) {
            showLandingPage();
        } else {
            showDesktopAbout();
        }
        syncProjectWithScroll(projects);
        bindScrollActivatedVideos();
    }
}

// Avvia l'applicazione
document.addEventListener('DOMContentLoaded', init);
