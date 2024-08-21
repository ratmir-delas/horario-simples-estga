document.addEventListener('DOMContentLoaded', () => {
    const courseSelect = document.getElementById('course');
    const yearSelect = document.getElementById('year');
    const groupSelect = document.getElementById('group');
    const weekSelect = document.getElementById('week');

    let data = {};

    // Fetch data from data.json
    fetch('data.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            populateDropdowns();
            loadPreferences();
            setDefaultWeek();
        })
        .catch(error => console.error('Error loading data:', error));

    function populateDropdowns() {
        // Populate course dropdown
        courseSelect.innerHTML = '<option value="">Seleciona o curso</option>';
        data.courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.name;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });

        // Attach event listeners
        courseSelect.addEventListener('change', updateYears);
        yearSelect.addEventListener('change', updateGroups);
        groupSelect.addEventListener('change', updateWeeks);
        document.getElementById('viewTimetable').addEventListener('click', viewTimetable);
    }

    function updateYears() {
        const selectedCourse = courseSelect.value;
        const course = data.courses.find(course => course.name === selectedCourse);

        // Clear year, group, and week dropdowns
        yearSelect.innerHTML = '<option value="">Seleciona o ano</option>';
        groupSelect.innerHTML = '<option value="">Seleciona a turma</option>';
        weekSelect.innerHTML = '<option value="">Seleciona a semana</option>';

        if (course) {
            course.years.forEach(year => {
                const option = document.createElement('option');
                option.value = year.name;
                option.textContent = year.name;
                yearSelect.appendChild(option);
            });
        }

        // Automatically select the first year if available
        if (yearSelect.options.length > 1) {
            yearSelect.selectedIndex = 1;
            updateGroups();
        }

        // Save preferences
        savePreferences();
    }

    function updateGroups() {
        const selectedCourse = courseSelect.value;
        const selectedYear = yearSelect.value;
        const course = data.courses.find(course => course.name === selectedCourse);
        const year = course?.years.find(year => year.name === selectedYear);

        // Clear group and week dropdowns
        groupSelect.innerHTML = '<option value="">Seleciona a turma</option>';
        weekSelect.innerHTML = '<option value="">Seleciona a semana</option>';

        if (year) {
            year.groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.name;
                option.textContent = group.name;
                groupSelect.appendChild(option);
            });
        }

        // Automatically select the first group if available
        if (groupSelect.options.length > 1) {
            groupSelect.selectedIndex = 1;
            updateWeeks();
        }

        // Save preferences
        savePreferences();
    }

    function updateWeeks() {
        const selectedCourse = courseSelect.value;
        const selectedYear = yearSelect.value;
        const selectedGroup = groupSelect.value;
        const course = data.courses.find(course => course.name === selectedCourse);
        const year = course?.years.find(year => year.name === selectedYear);
        const group = year?.groups.find(group => group.name === selectedGroup);

        // Clear week dropdown
        weekSelect.innerHTML = '<option value="">Seleciona a semana</option>';

        if (group) {
            group.weeks.forEach(week => {
                const option = document.createElement('option');
                option.value = `https://estgahorarios.web.ua.pt/1semestre/${week.link}`;
                option.textContent = week.name;
                weekSelect.appendChild(option);
            });

            setDefaultWeek();
        }

        // Save preferences
        savePreferences();
    }

    function savePreferences() {
        localStorage.setItem('selectedCourse', courseSelect.value);
        localStorage.setItem('selectedYear', yearSelect.value);
        localStorage.setItem('selectedGroup', groupSelect.value);
        localStorage.setItem('selectedWeek', weekSelect.value);
    }

    function loadPreferences() {
        const savedCourse = localStorage.getItem('selectedCourse');
        const savedYear = localStorage.getItem('selectedYear');
        const savedGroup = localStorage.getItem('selectedGroup');
        const savedWeek = localStorage.getItem('selectedWeek');

        if (savedCourse) {
            courseSelect.value = savedCourse;
            updateYears();
        }
        if (savedYear) {
            yearSelect.value = savedYear;
            updateGroups();
        }
        if (savedGroup) {
            groupSelect.value = savedGroup;
            updateWeeks();
        }
        if (savedWeek) {
            weekSelect.value = savedWeek;
        }
    }

    function setDefaultWeek() {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

        // Adjust to the start of the current week (Monday)
        const startOfWeek = new Date(now);
        const daysToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
        startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);

        // Format the start date of the week as "Semana DD-MM-YYYY"
        const day = String(startOfWeek.getDate()).padStart(2, '0');
        const month = String(startOfWeek.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = startOfWeek.getFullYear();
        const startOfWeekName = `Semana ${day}-${month}-${year}`;
        // log the start of the week
        console.log(startOfWeekName);

        // Find the matching option in the week dropdown
        const weekOptions = Array.from(weekSelect.options);
        const matchingWeekOption = weekOptions.find(option => option.text.includes(startOfWeekName));

        if (matchingWeekOption) {
            // Prevent duplicate "(semana atual)" label
            if (!matchingWeekOption.textContent.includes("(semana atual)")) {
                matchingWeekOption.textContent += " (semana atual)";
            }
            weekSelect.value = matchingWeekOption.value;
        } else {
            console.warn(`No matching week found for ${startOfWeekName}`);
        }
    }

    function viewTimetable() {
        const selectedWeekLink = weekSelect.value;

        if (selectedWeekLink) {
            window.open(selectedWeekLink, '_blank');
        }
    }
});