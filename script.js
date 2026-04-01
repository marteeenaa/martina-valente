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
    'radio_1.jpeg',
    'tesi_2.png',
    'font_1.png',
    'gurz_4.jpg',
    'dimitri_1.png',
    'dimitri_3.jpeg',
    'tesi_3.png',
    'AI_1.mp4',
    'casetta_0.jpeg',
    'dimitri_2.png',
    'AGF_1.jpg',
    'gurz_2.jpg',
    'tesi_2.jpeg',
    'tesi_1.jpeg',
    'radio_7.png',
    'AGF_3.jpg',
    'gurz_7.mp4',
    'radio_6.jpg',
    'casetta_1.jpg',
    'casetta_2.jpg',
    'radio_book_1.png',
    'radio_3.jpg',
    'casetta_3.jpg',
    'font_3.jpg',
    'radio_5.png',
    'tesi_4.png',
    'polano_2.jpg',
    'radio_book_2.png',
    'gurz_5.jpeg',
    'tesi_1.png',
    'tesi_1b.png',
    'font_2.jpg',
    'AGF_2.png'
];

function getMediaFileName(path) {
    return (path || '').split('/').pop();
}

const mobileViewport = window.matchMedia('(max-width: 900px)');

let lastSelectedProjectIndex = null;
let activeProjectIndex = null;
const projectCyclePositions = new Map();
let suppressScrollSyncUntil = 0;
const scrollSyncGuardMs = 180;

function temporarilySuppressScrollSync(durationMs = 700) {
    suppressScrollSyncUntil = Date.now() + durationMs;
}

function getProjectMediaElements(projectIndex) {
    return Array.from(document.querySelectorAll(`#images-container [data-project-index="${projectIndex}"]`));
}

function isMobileView() {
    return mobileViewport.matches;
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

function openMobileProjectOverlay(project) {
    const overlay = document.getElementById('mobile-project-overlay');
    const title = document.getElementById('mobile-project-title');

    if (!overlay || !title || !project) {
        return;
    }

    title.textContent = project.title || '';
    setDescriptionContent('mobile-project-description', project.description || '', project.title || '');
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
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mobile-overlay-open');
}

function bindMobileOverlayEvents() {
    const closeButton = document.getElementById('mobile-overlay-close');

    if (closeButton) {
        closeButton.addEventListener('click', closeMobileProjectOverlay);
    }

    mobileViewport.addEventListener('change', event => {
        if (!event.matches) {
            closeMobileProjectOverlay();
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
        populateProjectsList(projects);
        populateImages(projects);
        // Seleziona il primo progetto per default
        selectProject(0, projects);
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