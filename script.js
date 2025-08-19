document.addEventListener('DOMContentLoaded', () => {
    const { animate, stagger } = Motion;
    const BASE_URL = 'https://rickandmortyapi.com/api';

    // --- State ---
    const state = {
        characters: { page: 1, filters: {}, info: {} },
        locations: { page: 1, filters: {}, info: {} },
        episodes: { page: 1, filters: {}, info: {} },
    };

    // --- DOM Elements ---
    const getElement = (id) => document.getElementById(id);
    const elements = {
        characterContainer: getElement('character-container'),
        locationContainer: getElement('location-container'),
        episodeContainer: getElement('episode-container'),
        tabs: document.querySelectorAll('.tab-link'),
        tabContents: document.querySelectorAll('.tab-content'), 
        filters: {
            characterName: getElement('character-name-filter'),
            characterStatus: getElement('character-status-filter'),
            locationName: getElement('location-name-filter'),
            locationType: getElement('location-type-filter'),
            locationDimension: getElement('location-dimension-filter'),
            episodeName: getElement('episode-name-filter'),
            episodeCode: getElement('episode-code-filter'),
        },
        pagination: {
            characterPrev: getElement('character-prev'),
            characterNext: getElement('character-next'),
            locationPrev: getElement('location-prev'),
            locationNext: getElement('location-next'),
            episodePrev: getElement('episode-prev'),
            episodeNext: getElement('episode-next'),
        },
    };

    // --- Utility ---
    const debounce = (func, delay = 500) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    // --- Fetch and Display Functions ---
    const fetchAndDisplayCharacters = async () => {
        const page = state.characters.page;
        const filters = state.characters.filters;
        const Tidyfilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
        let filterQuery = new URLSearchParams(Tidyfilters).toString();
        if (filterQuery) {
            filterQuery = `&${filterQuery}`;
        }
        const url = `${BASE_URL}/character/?page=${page}${filterQuery}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            state.characters.info = data.info;

            elements.characterContainer.innerHTML = '';
            if (!data.results || data.results.length === 0) {
                elements.characterContainer.innerHTML = '<p>No se encontraron personajes.</p>';
                return;
            }
            data.results.forEach(character => {
                const card = document.createElement('div');
                card.classList.add('character-card');
                card.innerHTML = `
                    <div class="card-image-container">
                        <img src="${character.image}" alt="${character.name}">
                        <div class="status ${character.status}">${character.status === 'Alive' ? 'Vivo' : character.status === 'Dead' ? 'Muerto' : 'Desconocido'}</div>
                    </div>
                    <div class="card-content">
                        <h2>${character.name}</h2>
                        <p>Especie: ${character.species}</p>
                    </div>
                `;
                elements.characterContainer.appendChild(card);
            });
            updatePagination('characters');
            animate(
                ".character-card",
                { opacity: [0, 1], transform: ["scale(0.8)", "scale(1)"] },
                { delay: stagger(0.05), duration: 0.5, easing: "ease-out" }
            );
        } catch (error) {
            console.error('Error fetching characters:', error);
        }
    };

    const fetchAndDisplayLocations = async () => {
        const page = state.locations.page;
        const filters = state.locations.filters;
        const Tidyfilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
        let filterQuery = new URLSearchParams(Tidyfilters).toString();
        if (filterQuery) {
            filterQuery = `&${filterQuery}`;
        }
        const url = `${BASE_URL}/location/?page=${page}${filterQuery}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            state.locations.info = data.info;

            elements.locationContainer.innerHTML = '';
            if (!data.results || data.results.length === 0) {
                elements.locationContainer.innerHTML = '<p>No se encontraron lugares.</p>';
                return;
            }
            data.results.forEach(location => {
                const card = document.createElement('div');
                card.classList.add('location-card');
                card.innerHTML = `
                    <div class="card-content">
                        <h2>${location.name}</h2>
                        <p>Tipo: ${location.type}</p>
                        <p>Dimensión: ${location.dimension}</p>
                    </div>
                `;
                elements.locationContainer.appendChild(card);
            });
            updatePagination('locations');
            animate(
                ".location-card",
                { opacity: [0, 1], transform: ["scale(0.8)", "scale(1)"] },
                { delay: stagger(0.05), duration: 0.5, easing: "ease-out" }
            );
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const fetchAndDisplayEpisodes = async () => {
        const page = state.episodes.page;
        const filters = state.episodes.filters;
        const Tidyfilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
        let filterQuery = new URLSearchParams(Tidyfilters).toString();
        if (filterQuery) {
            filterQuery = `&${filterQuery}`;
        }
        const url = `${BASE_URL}/episode/?page=${page}${filterQuery}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            state.episodes.info = data.info;

            elements.episodeContainer.innerHTML = '';
            if (!data.results || data.results.length === 0) {
                elements.episodeContainer.innerHTML = '<p>No se encontraron episodios.</p>';
                return;
            }
            data.results.forEach(episode => {
                const card = document.createElement('div');
                card.classList.add('episode-card');
                card.innerHTML = `
                    <div class="card-content">
                        <h2>${episode.name}</h2>
                        <p>Fecha de Emisión: ${episode.air_date}</p>
                        <p>Código: ${episode.episode}</p>
                    </div>
                `;
                elements.episodeContainer.appendChild(card);
            });
            updatePagination('episodes');
            animate(
                ".episode-card",
                { opacity: [0, 1], transform: ["scale(0.8)", "scale(1)"] },
                { delay: stagger(0.05), duration: 0.5, easing: "ease-out" }
            );
        } catch (error) {
            console.error('Error fetching episodes:', error);
        }
    };

    const updatePagination = (section) => {
        const info = state[section].info;
        if (!info) return;
        elements.pagination[`${section}Prev`].disabled = !info.prev;
        elements.pagination[`${section}Next`].disabled = !info.next;
    };

    // --- Tab Logic ---
    const setupTabs = () => {
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = document.getElementById(tab.dataset.tab);

                elements.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                elements.tabContents.forEach(c => c.classList.remove('active'));
                target.classList.add('active');
            });
        });
    };

    // --- Event Listeners ---
    const setupEventListeners = () => {
        elements.filters.characterName.addEventListener('input', debounce(() => {
            state.characters.filters.name = elements.filters.characterName.value;
            state.characters.page = 1;
            fetchAndDisplayCharacters();
        }));
        elements.filters.characterStatus.addEventListener('change', () => {
            state.characters.filters.status = elements.filters.characterStatus.value;
            state.characters.page = 1;
            fetchAndDisplayCharacters();
        });

        elements.filters.locationName.addEventListener('input', debounce(() => {
            state.locations.filters.name = elements.filters.locationName.value;
            state.locations.page = 1;
            fetchAndDisplayLocations();
        }));
        elements.filters.locationType.addEventListener('input', debounce(() => {
            state.locations.filters.type = elements.filters.locationType.value;
            state.locations.page = 1;
            fetchAndDisplayLocations();
        }));
        elements.filters.locationDimension.addEventListener('input', debounce(() => {
            state.locations.filters.dimension = elements.filters.locationDimension.value;
            state.locations.page = 1;
            fetchAndDisplayLocations();
        }));

        elements.filters.episodeName.addEventListener('input', debounce(() => {
            state.episodes.filters.name = elements.filters.episodeName.value;
            state.episodes.page = 1;
            fetchAndDisplayEpisodes();
        }));
        elements.filters.episodeCode.addEventListener('input', debounce(() => {
            state.episodes.filters.episode = elements.filters.episodeCode.value;
            state.episodes.page = 1;
            fetchAndDisplayEpisodes();
        }));

        elements.pagination.characterPrev.addEventListener('click', () => {
            if (state.characters.info.prev) {
                state.characters.page--;
                fetchAndDisplayCharacters();
            }
        });
        elements.pagination.characterNext.addEventListener('click', () => {
            if (state.characters.info.next) {
                state.characters.page++;
                fetchAndDisplayCharacters();
            }
        });

        elements.pagination.locationPrev.addEventListener('click', () => {
            if (state.locations.info.prev) {
                state.locations.page--;
                fetchAndDisplayLocations();
            }
        });
        elements.pagination.locationNext.addEventListener('click', () => {
            if (state.locations.info.next) {
                state.locations.page++;
                fetchAndDisplayLocations();
            }
        });

        elements.pagination.episodePrev.addEventListener('click', () => {
            if (state.episodes.info.prev) {
                state.episodes.page--;
                fetchAndDisplayEpisodes();
            }
        });
        elements.pagination.episodeNext.addEventListener('click', () => {
            if (state.episodes.info.next) {
                state.episodes.page++;
                fetchAndDisplayEpisodes();
            }
        });
    };


    // --- Initial Load ---
    const initialize = () => {
        fetchAndDisplayCharacters();
        fetchAndDisplayLocations();
        fetchAndDisplayEpisodes();
        setupTabs();
        setupEventListeners();
    };

    initialize();
});
