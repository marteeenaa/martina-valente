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
    'font_1.webp',
    'gurz_4.webp',
    'dimitri_1.webp',
    'dimitri_3.webp',
    'tesi_3.webp',
    'AI_1.mp4',
    'casetta_0.webp',
    'dimitri_2.webp',
    'AGF_1.webp',
    'gurz_2.webp',
    'tesi_2b.webp',
    'tesi_1 copy.webp',
    'radio_7.webp',
    'AGF_3.webp',
    'gurz_7.mp4',
    'radio_6.webp',
    'casetta_1.webp',
    'casetta_2.webp',
    'radio_book_1.webp',
    'radio_3.webp',
    'casetta_3.webp',
    'font_3.webp',
    'radio_5.webp',
    'tesi_4.webp',
    'polano_2.webp',
    'radio_book_2.webp',
    'gurz_5.webp',
    'tesi_1.webp',
    'tesi_1b.webp',
    'font_2.webp',
    'AGF_2.webp'
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
    return /\.(webp|mp4)$/i.test(path || '');
}

function getMediaFileName(path) {
    return (path || '').split('/').pop();
}

const mobileViewport = window.matchMedia('(max-width: 900px)');

let lastSelectedProjectIndex = null;
let activeProjectIndex = null;
const projectCyclePositions = new Map();
let suppressScrollSyncUntil = 0;
const scrollSyncGuardMs = 180;
let landingRandomMediaPool = [];
let landingRandomPlacementPool = [];

function temporarilySuppressScrollSync(durationMs = 700) {
    suppressScrollSyncUntil = Date.now() + durationMs;
}

function getProjectMediaElements(projectIndex) {
    return Array.from(document.querySelectorAll(`#images-container [data-project-index="${projectIndex}"]`));
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

function splitDescriptionText(rawDescription) {
    const description = String(rawDescription || '').trim();
    if (!description) {
        return { main: '', last: '' };
    }

    const paragraphs = description
        .split(/\n\s*\n/)
        .map(block => block.trim())
        .filter(Boolean);

    if (paragraphs.length >= 2) {
        const last = paragraphs.pop();
        return {
            main: paragraphs.join('\n\n'),
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
    return projectTitle !== 'Ci sono muri troppo alti per te' && projectTitle !== '10JA Exhibition – Dimitri Bähler';
}

function setDescriptionContent(prefix, descriptionText, projectTitle = '') {
    const mainElement = document.getElementById(`${prefix}-main`);
    const lastElement = document.getElementById(`${prefix}-last`);

    if (!mainElement || !lastElement) {
        return;
    }

    if (!shouldSplitDescription(projectTitle)) {
        mainElement.textContent = String(descriptionText || '').trim();
        lastElement.textContent = '';
        return;
    }

    const { main, last } = splitDescriptionText(descriptionText);
    mainElement.textContent = main;
    lastElement.textContent = last;
}

function getLandingDescriptionText() {
    const paragraphs = Array.from(document.querySelectorAll('#landing-description p'))
        .map(paragraph => paragraph.textContent.trim())
        .filter(Boolean);

    return paragraphs.join('\n\n');
}

function openMobileProjectOverlay(content = {}) {
    const overlay = document.getElementById('mobile-project-overlay');
    const title = document.getElementById('mobile-project-title');

    if (!overlay || !title) {
        return;
    }

    const {
        title: overlayTitle = '',
        description = '',
        colorTheme = 'default'
    } = content;

    title.textContent = overlayTitle;
    title.hidden = !overlayTitle;
    setDescriptionContent('mobile-project-description', description, overlayTitle);
    overlay.classList.toggle('is-landing-copy', colorTheme === 'landing');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('mobile-overlay-open');
}

function closeMobileProjectOverlay() {
    const overlay = document.getElementById('mobile-project-overlay');

    if (!overlay) {
        return;
    }

    overlay.classList.remove('is-open');
    overlay.classList.remove('is-landing-copy');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mobile-overlay-open');
}

function bindMobileOverlayEvents() {
    const closeButton = document.getElementById('mobile-overlay-close');
    const mobileAboutButton = document.getElementById('mobile-about-button');

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

// Funzioni per la landing page
function showLandingPage() {
    const imagesColumn = document.getElementById('images-column');
    clearLandingRandomImages();
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
}

function bindLogoEvents() {
    const logoLink = document.getElementById('logo-link');
    const mobileLogoButton = document.getElementById('mobile-logo-button');

    if (logoLink) {
        logoLink.addEventListener('click', showLandingPage);
    }

    if (mobileLogoButton) {
        mobileLogoButton.addEventListener('click', showLandingPage);
    }
}

function clearLandingRandomImages() {
    const container = document.getElementById('landing-random-images');

    if (!container) {
        return;
    }

    container.innerHTML = '';
    landingRandomPlacementPool = [];
}

function createRandomLandingImage() {
    const container = document.getElementById('landing-random-images');
    const landingPage = document.getElementById('landing-page');

    if (!container || !landingPage) {
        return;
    }

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
        const landingPage = document.getElementById('landing-page');
        const landingHeight = landingPage ? landingPage.offsetHeight : 0;
        const hasLeftLanding = landingHeight > 0 && imagesColumn.scrollTop >= landingHeight * 0.5;

        if (hasLeftLanding || hasFirstProjectMediaReachedHeader()) {
            clearLandingRandomImages();
        }
    });
}

// Popola la lista dei progetti
function populateProjectsList(projects) {
    const projectsList = document.getElementById('projects-list');
    projects.forEach((project, index) => {
        const li = document.createElement('li');
        li.dataset.index = index;
        li.addEventListener('click', () => selectProject(index, projects));

        const title = document.createElement('div');
        title.className = 'project-item-title';
        title.textContent = project.title;

        const meta = document.createElement('div');
        meta.className = 'project-item-meta';
        meta.textContent = project.date || '';

        li.appendChild(meta);
        li.appendChild(title);

        projectsList.appendChild(li);
    });
}

// Popola tutte le immagini nella colonna centrale
function populateImages(projects) {
    const imagesContainer = document.getElementById('images-container');
    imagesContainer.innerHTML = '';

    const orderMap = new Map(centralMediaOrder.map((fileName, index) => [fileName, index]));
    const allMedia = [];

    projects.forEach((project, projectIndex) => {
        (project.images || []).forEach((imageSrc, imageIndex) => {
            if (!hasAllowedExtension(imageSrc)) {
                return;
            }

            allMedia.push({
                src: imageSrc,
                projectIndex,
                projectTitle: project.title,
                imageIndex
            });
        });
    });

    const linkedFileNames = new Set(allMedia.map(media => getMediaFileName(media.src)));
    centralMediaOrder.forEach((fileName, orderIndex) => {
        if (!hasAllowedExtension(fileName)) {
            return;
        }

        if (!linkedFileNames.has(fileName)) {
            allMedia.push({
                src: `images/${fileName}`,
                projectIndex: null,
                projectTitle: '',
                imageIndex: Number.MAX_SAFE_INTEGER + orderIndex,
                isStandalone: true
            });
        }
    });

    allMedia.sort((a, b) => {
        const orderA = orderMap.get(getMediaFileName(a.src));
        const orderB = orderMap.get(getMediaFileName(b.src));
        const rankA = orderA === undefined ? Number.MAX_SAFE_INTEGER : orderA;
        const rankB = orderB === undefined ? Number.MAX_SAFE_INTEGER : orderB;

        if (rankA !== rankB) {
            return rankA - rankB;
        }

        if (a.projectIndex !== b.projectIndex) {
            return (a.projectIndex ?? Number.MAX_SAFE_INTEGER) - (b.projectIndex ?? Number.MAX_SAFE_INTEGER);
        }

        return a.imageIndex - b.imageIndex;
    });

    allMedia.forEach(media => {
        let element;
        if (media.src.endsWith('.mp4') || media.src.endsWith('.webm') || media.src.endsWith('.ogg')) {
            // È un video
            element = document.createElement('video');
            element.src = media.src;
            element.controls = false;
            element.muted = true;
        } else {
            // È un'immagine
            element = document.createElement('img');
            element.src = media.src;
            element.alt = media.projectTitle ? `Immagine per ${media.projectTitle}` : `Immagine ${getMediaFileName(media.src)}`;
        }

        if (media.projectIndex !== null && media.projectIndex !== undefined) {
            element.dataset.projectIndex = media.projectIndex;
            element.addEventListener('click', () => {
                if (isMobileView()) {
                    openMobileProjectOverlay(projects[media.projectIndex]);
                    return;
                }

                selectProject(media.projectIndex, projects, element);
            });
        }

        imagesContainer.appendChild(element);
    });
}

function scrollProjectToTop(index, clickedElement = null) {
    const imagesColumn = document.getElementById('images-column');
    const targetElement = clickedElement || document.querySelector(`#images-container [data-project-index="${index}"]`);

    if (!imagesColumn || !targetElement) {
        return;
    }

    const columnTop = imagesColumn.getBoundingClientRect().top;
    const targetTop = targetElement.getBoundingClientRect().top;
    const scrollOffset = targetTop - columnTop + imagesColumn.scrollTop;

    imagesColumn.scrollTo({
        top: scrollOffset,
        behavior: 'smooth'
    });
}

function updateActiveProject(index, projects) {
    const project = projects[index];

    if (!project) {
        return;
    }

    // Evita re-render della colonna descrizione se il progetto attivo non cambia.
    if (activeProjectIndex === index) {
        return;
    }

    document.querySelectorAll('#projects-list li').forEach(li => li.classList.remove('active'));

    const activeItem = document.querySelector(`#projects-list li[data-index="${index}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }

    document.getElementById('project-title').textContent = project.title;
    setDescriptionContent('project-description', project.description, project.title || '');
    activeProjectIndex = index;
}

function syncProjectWithScroll(projects) {
    const imagesColumn = document.getElementById('images-column');
    const mediaElements = Array.from(document.querySelectorAll('#images-container [data-project-index]'));

    if (!imagesColumn || mediaElements.length === 0) {
        return;
    }

    let ticking = false;

    const updateFromScroll = () => {
        if (Date.now() < suppressScrollSyncUntil) {
            ticking = false;
            return;
        }

        // Gestione landing: se siamo nel primo 50% dell'altezza della landing, ripristina landing-active
        const landingPage = document.getElementById('landing-page');
        const landingHeight = landingPage ? landingPage.offsetHeight : 0;
        if (imagesColumn.scrollTop < landingHeight * 0.5) {
            if (!document.body.classList.contains('landing-active')) {
                document.body.classList.add('landing-active');
                document.querySelectorAll('#projects-list li').forEach(li => li.classList.remove('active'));
                activeProjectIndex = null;
                lastSelectedProjectIndex = null;
            }
            ticking = false;
            return;
        } else {
            document.body.classList.remove('landing-active');
        }

        const columnTop = imagesColumn.getBoundingClientRect().top;
        const currentElement = mediaElements.find(element => element.getBoundingClientRect().bottom > columnTop);

        if (currentElement) {
            updateActiveProject(Number(currentElement.dataset.projectIndex), projects);
        }

        ticking = false;
    };

    imagesColumn.addEventListener('scroll', () => {
        if (Date.now() < suppressScrollSyncUntil) {
            // Se lo scroll è programmato, estendi il blocco finché il movimento continua.
            suppressScrollSyncUntil = Date.now() + scrollSyncGuardMs;
            return;
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
    let targetElement = clickedElement;
    const isFromLeftColumnClick = !clickedElement;

    if (!targetElement) {
        const projectMediaElements = getProjectMediaElements(index);

        if (projectMediaElements.length > 0) {
            let nextPosition = 0;

            if (lastSelectedProjectIndex === index) {
                const currentPosition = projectCyclePositions.get(index) ?? 0;
                nextPosition = (currentPosition + 1) % projectMediaElements.length;
            }

            projectCyclePositions.set(index, nextPosition);
            targetElement = projectMediaElements[nextPosition];
        }
    } else {
        const projectMediaElements = getProjectMediaElements(index);
        const clickedPosition = projectMediaElements.indexOf(targetElement);

        if (clickedPosition >= 0) {
            projectCyclePositions.set(index, clickedPosition);
        }
    }

    hideLandingPage();
    clearLandingRandomImages();
    updateActiveProject(index, projects);

    if (isFromLeftColumnClick) {
        temporarilySuppressScrollSync();
    }

    scrollProjectToTop(index, targetElement);
    lastSelectedProjectIndex = index;
}

// Inizializza il sito
async function init() {
    const projects = await loadProjects();
    if (projects.length > 0) {
        bindMobileOverlayEvents();
        bindLogoEvents();
        bindLandingRandomImages();
        populateProjectsList(projects);
        populateImages(projects);
        // Mostra la landing page per default
        showLandingPage();
        syncProjectWithScroll(projects);

        // Configura l'osservatore per i video
        const videos = document.querySelectorAll('video');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.play();
                } else {
                    entry.target.pause();
                }
            });
        }, { threshold: 0.1 }); // 10% visibile per iniziare
        videos.forEach(video => observer.observe(video));
    }
}

// Avvia l'applicazione
document.addEventListener('DOMContentLoaded', init);
