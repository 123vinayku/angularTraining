let learningData = [];

function getAccordionRoot() {
	return document.getElementById('cAccordion');
}

function getData() {
	return fetch('./data.json').then((response) => response.json());
}

function makeId(text) {
	return text.replace(' ', '_');
}

function storeData(techId, id) {
	const progressData = getStoredData();
	if (progressData) {
		progressData.push(`${techId}[${id}]`);
		localStorage.setItem('progress', JSON.stringify(progressData));
	} else {
		localStorage.setItem('progress', JSON.stringify([`${techId}[${id}]`]));
	}
}

function getStoredData() {
	const res = localStorage.getItem('progress');
	return res ? JSON.parse(res) : null;
}

function checkIfDoneOrNot(id, techId) {
	const data = getStoredData();
	if (data) {
		return data.findIndex((e) => e === `${techId}[${id}]`) > -1;
	} else return false;
}

function topicMarkDone(id, techId) {
	const topicIndex = learningData.find((e) => e.id === techId).concepts.findIndex((e) => e.label === id.replace('_', ' '));
	const techDetals = learningData.find((e) => e.id === techId);
	if (topicIndex > -1 && techDetals) {
		const nextTopicId = makeId(techDetals.concepts[topicIndex + 1].label);
		const topicButtonElement = document.getElementById(id);
		const topicButtonCheckMarkElement = document.getElementById(`${id}_checkmark`);
		topicButtonElement.classList.remove('active');
		topicButtonCheckMarkElement.classList.remove('none');
		const nextTopicElement = document.getElementById(nextTopicId);
		nextTopicElement.removeAttribute('disabled');
		storeData(techId, id);
		topicClicked(nextTopicId, techId);
	}
}

function removeChildButtonsHavingActiveClass(techId) {
	const parent = document.getElementById(`${techId}_list_group`);
	Array.from(parent.children).forEach((child) => {
		child.classList.remove('active');
	});
}

function topicClicked(id, techId) {
	const topicDetails = learningData.find((e) => e.id === techId).concepts.find((e) => e.label === id.replace('_', ' '));
	const parentFrameElement = document.getElementById('frame');
	removeChildButtonsHavingActiveClass(techId);
	const topicButtonElement = document.getElementById(id);
	topicButtonElement.classList.add('active');
	const alreadyDone = checkIfDoneOrNot(id, techId);
	const disableMarkDone = alreadyDone ? 'disabled' : '';

	const frameElement = `
        <div class="d-flex flex-row justify-content-between border-bottom align-items-center">
			<h5>${topicDetails.label}</h5>
			<div class="d-flex flex-row mb-2">
				<a
					href="${topicDetails.link}"
					target="_blank"
					class="btn btn-primary"
					id="openLink">
					Open Link
				</a>
				<button
					type="button"
                    ${disableMarkDone}
					class="btn btn-outline-primary ms-2"
                    onclick="topicMarkDone('${id}', '${techId}')"
					id="markDone">
					Mark Done
				</button>
			</div>
		</div>
		<div class="iframe">
			<iframe
				src="${topicDetails.link}"
				allowfullscreen="true"
				loading="lazy"
				name="${topicDetails.label}"
				id="${id}_frame"
				width="100%"
				height="500"></iframe>
		</div>
    `;
	parentFrameElement.innerHTML = frameElement;
}

function addListGroup(concepts, techId) {
	let conceptElement = '';

	for (let i = 0; i < concepts.length; i++) {
		const id = makeId(concepts[i].label);
		const alreadyDone = checkIfDoneOrNot(id, techId);
		const previousDone = i > 0 ? checkIfDoneOrNot(makeId(concepts[i - 1].label), techId) : true;
		const disabledAttr = !alreadyDone && !previousDone ? 'disabled' : '';
		conceptElement += `
                <button
                    type="button"
                    class="list-group-item list-group-item-action"
                    ${disabledAttr} 
                    aria-current="true"
                    onclick="topicClicked('${id}', '${techId}')"
                    id="${id}">
                    <div class="d-flex flex-row justify-content-between align-items-center">
                        <div>${concepts[i].label}</div>
                        <div id="${id}_checkmark" class="${!alreadyDone ? 'none' : ''}">&#9989;</div>
                    </div>
                </button>
        `;
	}
	return conceptElement;
}

(async () => {
	const data = await getData();
	const sidebarElement = getAccordionRoot();
	let techContainers = '';
	learningData = data;

	for (let i = 0; i < learningData.length; i++) {
		techContainers += `
            <div class="accordion-item">
				<h2 class="accordion-header">
					<button
					    class="accordion-button collapsed"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#${data[i].id}"
						aria-expanded="false"
						aria-controls="${data[i].id}">
						${data[i].tech}
					</button>
				</h2>
				<div
					id="${data[i].id}"
					class="accordion-collapse collapse"
					data-bs-parent="#cAccordion">
					<div class="accordion-body">
                        <div class="list-group" id="${data[i].id}_list_group">
                            ${addListGroup(data[i].concepts, data[i].id)}
                        </div>
					</div>
				</div>
			</div>
        `;
	}
	sidebarElement.innerHTML = techContainers;
})();
