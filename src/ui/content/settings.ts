import "../../styles/content/settings.css";

export type Settings = {
	element: HTMLElement;
};

export function createSettings(): Settings {
	const element = document.createElement("div");
	element.className = "settings";

	const contentEl = document.createElement("div");
	contentEl.className = "settings__content";
	element.appendChild(contentEl);

	return {
		element
	};
}