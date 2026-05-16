document.addEventListener('DOMContentLoaded', function () {
    const username = "PenguineDavid";
    const CACHE_KEY = `gh_lang_data_${username}`;
    const CACHE_TIME_KEY = `gh_lang_time_${username}`;
    const ONE_HOUR = 60 * 60 * 1000;

    const statusEl = document.getElementById('gh-chart-status');
    document.getElementById('gh-chart-title').textContent = `${username}'s Automated GitHub Metrics`;

    const languageColors = {
        "JavaScript": "#f0db4f",
        "Python": "#3572A5",
        "HTML": "#e34c26",
        "CSS": "#563d7c",
        "TypeScript": "#007acc",
        "C++": "#00599C",
        "C#": "#178600",
        "Java": "#ED8B00",
        "Go": "#00ADD8",
        "Ruby": "#701516",
        "Shell": "#89e051",
        "C": "#A8B9CC"
    };

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    async function fetchGitHubData() {
        statusEl.textContent = "Requesting metrics profiles from public directory endpoints...";
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        if (!reposResponse.ok) throw new Error("Failed to load user repositories. Check API limits.");
        const repos = await reposResponse.json();

        const languageCounts = {};
        let processedCount = 0;

        for (const repo of repos) {
            if (repo.fork) continue;
            processedCount++;
            statusEl.textContent = `Compiling code blocks from codebase repositories (${processedCount}/${repos.length})...`;

            try {
                const langResponse = await fetch(repo.languages_url);
                if (langResponse.ok) {
                    const langs = await langResponse.json();
                    for (const [lang, bytes] of Object.entries(langs)) {
                        languageCounts[lang] = (languageCounts[lang] || 0) + bytes;
                    }
                }
            } catch (err) {
                console.warn(`Could not fetch languages for ${repo.name}`, err);
            }
        }

        const totalBytes = Object.values(languageCounts).reduce((a, b) => a + b, 0);
        if (totalBytes === 0) throw new Error("No language data found across public repositories.");

        let processedData = Object.entries(languageCounts).map(([name, bytes]) => ({
            name,
            percent: parseFloat(((bytes / totalBytes) * 100).toFixed(1)),
            color: languageColors[name] || getRandomColor()
        }));

        processedData.sort((a, b) => b.percent - a.percent);

        if (processedData.length > 5) {
            const topSlices = processedData.slice(0, 5);
            const topSum = topSlices.reduce((sum, item) => sum + item.percent, 0);
            const otherPercent = parseFloat((100 - topSum).toFixed(1));

            if (otherPercent > 0) {
                topSlices.push({
                    name: "Others",
                    percent: otherPercent,
                    color: "#95a5a6"
                });
            }
            processedData = topSlices;
        }

        return processedData;
    }

    function drawChart(pieData) {
        const chartLayer = document.getElementById('chart-layer');
        const uiLayer = document.getElementById('ui-layer');
        const cx = 0, cy = 0, baseRadius = 140;
        const hoverRadius = baseRadius * 1.08;

        while (chartLayer.childNodes.length > 1) chartLayer.removeChild(chartLayer.lastChild);
        uiLayer.innerHTML = '';

        function sectorPath(radius, start, end) {
            const x1 = radius * Math.cos(start);
            const y1 = radius * Math.sin(start);
            const x2 = radius * Math.cos(end);
            const y2 = radius * Math.sin(end);
            const largeArc = (end - start) > Math.PI ? 1 : 0;
            return [
                `M ${cx} ${cy}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');
        }

        let currentStartAngle = -Math.PI / 2;
        const labelsMetadata = [];

        pieData.forEach((item) => {
            if (item.percent <= 0) return;

            const sliceAngle = (item.percent / 100) * Math.PI * 2;
            const startAngle = currentStartAngle;
            const endAngle = startAngle + sliceAngle;
            const midAngle = startAngle + sliceAngle / 2;

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'slice-path');
            path.setAttribute('d', sectorPath(baseRadius, startAngle, endAngle));
            path.setAttribute('fill', item.color);
            g.appendChild(path);

            g.addEventListener('mouseenter', () => {
                path.setAttribute('d', sectorPath(hoverRadius, startAngle, endAngle));
                path.classList.add('hovered');
                chartLayer.appendChild(g);
            });

            g.addEventListener('mouseleave', () => {
                path.setAttribute('d', sectorPath(baseRadius, startAngle, endAngle));
                path.classList.remove('hovered');
            });

            chartLayer.appendChild(g);

            const startR = baseRadius * 0.92;
            const bendR = baseRadius * 1.25;

            const nodeX = startR * Math.cos(midAngle);
            const nodeY = startR * Math.sin(midAngle);
            const bendX = bendR * Math.cos(midAngle);
            const initialBendY = bendR * Math.sin(midAngle);

            const normalizedAngle = (midAngle + Math.PI * 2) % (Math.PI * 2);
            const signX = (normalizedAngle > Math.PI / 2 && normalizedAngle < 3 * Math.PI / 2) ? -1 : 1;

            labelsMetadata.push({
                item,
                nodeX,
                nodeY,
                bendX,
                initialBendY,
                currentY: initialBendY,
                signX
            });

            currentStartAngle = endAngle;
        });

        const minDistance = 38;
        const leftSide = labelsMetadata.filter(l => l.signX === -1).sort((a, b) => a.initialBendY - b.initialBendY);
        const rightSide = labelsMetadata.filter(l => l.signX === 1).sort((a, b) => a.initialBendY - b.initialBendY);

        function relaxLabels(labelArray) {
            if (labelArray.length === 0) return;
            for (let i = 1; i < labelArray.length; i++) {
                if (labelArray[i].currentY - labelArray[i - 1].currentY < minDistance) {
                    labelArray[i].currentY = labelArray[i - 1].currentY + minDistance;
                }
            }
            for (let i = labelArray.length - 2; i >= 0; i--) {
                if (labelArray[i + 1].currentY - labelArray[i].currentY < minDistance) {
                    labelArray[i].currentY = labelArray[i + 1].currentY - minDistance;
                }
            }
        }

        relaxLabels(leftSide);
        relaxLabels(rightSide);

        labelsMetadata.forEach(({ item, nodeX, nodeY, bendX, currentY, signX }) => {
            const horizLen = 50;
            const endX = bendX + signX * horizLen;
            const endY = currentY;

            const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline.setAttribute('points', `${nodeX},${nodeY} ${bendX},${endY} ${endX},${endY}`);
            polyline.setAttribute('class', 'leader-line');
            uiLayer.appendChild(polyline);

            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', nodeX);
            dot.setAttribute('cy', nodeY);
            dot.setAttribute('r', 4);
            dot.setAttribute('class', 'node-dot');
            uiLayer.appendChild(dot);

            const bubbleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            bubbleGroup.setAttribute('transform', `translate(${endX}, ${endY})`);

            const labelText = `${item.name} (${item.percent}%)`;
            const padding = 10;
            const charW = 6.5;
            const bubbleHeight = 24;
            const bubbleRX = 5;
            const bubbleWidth = Math.max(70, labelText.length * charW + padding * 2);
            const rectX = signX === 1 ? 0 : -bubbleWidth;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', rectX);
            rect.setAttribute('y', -bubbleHeight / 2);
            rect.setAttribute('width', bubbleWidth);
            rect.setAttribute('height', bubbleHeight);
            rect.setAttribute('rx', bubbleRX);
            rect.setAttribute('class', 'bubble-bg');

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', signX === 1 ? bubbleWidth / 2 : -bubbleWidth / 2);
            text.setAttribute('y', 0);
            text.setAttribute('class', 'bubble-text');
            text.textContent = labelText;

            bubbleGroup.appendChild(rect);
            bubbleGroup.appendChild(text);
            uiLayer.appendChild(bubbleGroup);
        });
    }

    async function init() {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cachedData && cachedTime && (now - cachedTime < ONE_HOUR)) {
            statusEl.textContent = "Data verified. Synchronized directly with cache memory storage.";
            drawChart(JSON.parse(cachedData));
        } else {
            try {
                const freshData = await fetchGitHubData();
                localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
                localStorage.setItem(CACHE_TIME_KEY, now.toString());

                statusEl.textContent = "Metrics synchronized natively via live GitHub API core.";
                drawChart(freshData);
            } catch (error) {
                console.error(error);
                if (cachedData) {
                    statusEl.textContent = "API endpoint throttled. Running older stored mirror profile.";
                    drawChart(JSON.parse(cachedData));
                } else {
                    statusEl.textContent = `Sync Error: ${error.message}`;
                }
            }
        }
    }

    init();
});