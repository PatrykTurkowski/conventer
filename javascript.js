function convertICStoCSV(icsContent) {
    const events = icsContent.split("BEGIN:VEVENT");
    let csvContent = "dtstart,dtend,organizer,location,summary\n"; // Dodano kolumnę "summary"

    for (let i = 1; i < events.length; i++) {
        const event = events[i];

        const startDateMatch = event.match(/DTSTART:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
        const endDateMatch = event.match(/DTEND:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
        const organizerMatch = event.match(/ORGANIZER:(.+)/);
        const locationMatch = event.match(/LOCATION:(.+)/);
        const summaryMatch = event.match(/SUMMARY:(.+)/); // Dodano przetwarzanie informacji "summary"

        const startDate = startDateMatch ? `"${startDateMatch[1]}-${startDateMatch[2]}-${startDateMatch[3]}T${startDateMatch[4]}:${startDateMatch[5]}:${startDateMatch[6]}Z"` : '""';
        const endDate = endDateMatch ? `"${endDateMatch[1]}-${endDateMatch[2]}-${endDateMatch[3]}T${endDateMatch[4]}:${endDateMatch[5]}:${endDateMatch[6]}Z"` : '""';
        const organizer = organizerMatch ? `"${organizerMatch[1].replace(/mailto:/, '')}"` : '""';
        const location = locationMatch ? `"${locationMatch[1].replace(/\\,/g, ',').replace(/\r?\n|\r/g, ' ').trim()}"` : '""';
        const summary = summaryMatch ? `"${summaryMatch[1].replace(/\\,/g, ',').replace(/\r?\n|\r/g, ' ').trim()}"` : '""'; // Dodano przetwarzanie informacji "summary"

        csvContent += `${startDate},${endDate},${organizer},${location},${summary}\n`;
    }

    return csvContent;
}

function removePastEventsFromCSV(csvContent) {
    const rows = csvContent.split("\n");
    const currentDate = new Date();

    const filteredRows = rows.filter((row, index) => {
        if (index === 0) return true; // Zawsze zachowaj nagłówek

        const columns = row.split(",");
        if (columns.length < 4) return false;

        const endDateStr = columns[1].replace(/"/g, "");
        if (!endDateStr) return false;

        const eventEndDate = new Date(endDateStr);
        return eventEndDate >= currentDate;
    });

    return filteredRows.join("\n");
}

function processICS() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const icsData = e.target.result;
            const csvData = convertICStoCSV(icsData);
            const updatedCSV = removePastEventsFromCSV(csvData);

            const blob = new Blob([updatedCSV], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = url;
            downloadLink.style.display = 'block';
        };

        reader.readAsText(file);
    } else {
        alert("Proszę wybrać plik ICS.");
    }
}