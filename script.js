let inputLabels = ['Input 1', 'Input 2', 'Input 3', 'Input 4'];
let outputLabels = ['Output 1', 'Output 2'];

function generateLabelInputs(containerId, labels, updateFunction) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const neuronCount = containerId === 'inputLabels' ? 
        parseInt(document.getElementById('inputNeurons').value) : 
        parseInt(document.getElementById('outputNeurons').value);
    
    for (let i = 0; i < neuronCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Label ${i + 1}`;
        input.value = labels[i] || (containerId === 'inputLabels' ? `Input ${i + 1}` : `Output ${i + 1}`);
        input.onchange = (e) => {
            labels[i] = e.target.value;
            updateFunction();
        };
        container.appendChild(input);
    }
}

function generateMLP() {
    const svg = document.getElementById('mlp-svg');
    svg.innerHTML = '';
    
    const inputNeurons = parseInt(document.getElementById('inputNeurons').value);
    const hiddenLayers = document.getElementById('hiddenLayers').value.split(',').map(Number);
    const outputNeurons = parseInt(document.getElementById('outputNeurons').value);
    const inputColor = document.getElementById('inputColor').value;
    const hiddenColor = document.getElementById('hiddenColor').value;
    const outputColor = document.getElementById('outputColor').value;

    const layerGap = 200;
    const neuronGap = 100;
    const svgWidth = (2 + hiddenLayers.length) * layerGap;
    const svgHeight = Math.max(...hiddenLayers, inputNeurons, outputNeurons) * neuronGap;
    
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', svgHeight);

    const layers = [inputNeurons, ...hiddenLayers, outputNeurons];
    const colors = [inputColor, ...Array(hiddenLayers.length).fill(hiddenColor), outputColor];

    let prevLayer = [];
    layers.forEach((neurons, layerIndex) => {
        const x = layerIndex * layerGap + 100;
        const isInput = layerIndex === 0;
        const isOutput = layerIndex === layers.length - 1;
        const neurons_positions = drawLayer(svg, x, neurons, svgHeight, colors[layerIndex], isInput || isOutput, isInput, isOutput);
        
        if (layerIndex > 0) {
            drawConnections(svg, prevLayer, neurons_positions);
        }
        prevLayer = neurons_positions;
    });
}

function drawLayer(svg, x, neurons, svgHeight, color, isIO, isInput, isOutput) {
    const positions = [];
    const neuronGap = svgHeight / (neurons + 1);
    const radius = isIO ? 25 : 20;
    
    for (let i = 0; i < neurons; i++) {
        const y = (i + 1) * neuronGap;
        positions.push({x, y, radius});
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', color);
        svg.appendChild(circle);

        if (isIO) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y + 5);
            text.setAttribute('font-family', 'Arial');
            text.setAttribute('font-size', '12');
            text.setAttribute('fill', '#FFFFFF');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-weight', 'bold');
            if (isInput) {
                text.textContent = inputLabels[i] || `Input ${i + 1}`;
            } else if (isOutput) {
                text.textContent = outputLabels[i] || `Output ${i + 1}`;
            } else {
                text.textContent = `N${i + 1}`;
            }
            svg.appendChild(text);
        }
    }
    return positions;
}

function drawConnections(svg, prevLayer, currentLayer) {
    for (const prev of prevLayer) {
        const x1 = prev.x + prev.radius;
        const y1 = prev.y;
        
        for (const current of currentLayer) {
            const x2 = current.x - current.radius;
            const y2 = current.y;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', '#000000');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('opacity', '0.2');
            svg.appendChild(line);
        }
    }
}

function updateLabelsAndMLP() {
    generateLabelInputs('inputLabels', inputLabels, generateMLP);
    generateLabelInputs('outputLabels', outputLabels, generateMLP);
    generateMLP();
}

function downloadSVG() {
    const svg = document.getElementById('mlp-svg');
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    downloadFile(url, 'mlp_visualization.svg');
}

function downloadPNG() {
    const svg = document.getElementById('mlp-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
        canvas.width = svg.width.baseVal.value;
        canvas.height = svg.height.baseVal.value;
        ctx.drawImage(img, 0, 0);
        const pngData = canvas.toDataURL('image/png');
        downloadFile(pngData, 'mlp_visualization.png');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

function downloadJPG() {
    const svg = document.getElementById('mlp-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
        canvas.width = svg.width.baseVal.value;
        canvas.height = svg.height.baseVal.value;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const jpgData = canvas.toDataURL('image/jpeg', 0.8);
        downloadFile(jpgData, 'mlp_visualization.jpg');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

function downloadFile(data, filename) {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initial generation
updateLabelsAndMLP();

// Update labels when the number of neurons changes
document.getElementById('inputNeurons').addEventListener('change', updateLabelsAndMLP);
document.getElementById('outputNeurons').addEventListener('change', updateLabelsAndMLP);
document.getElementById('hiddenLayers').addEventListener('change', updateLabelsAndMLP);