import "../styles/dock.css";
import dockTemplate from "../templates/dock.html?raw";

export type Dock = {
	addMenu(button: HTMLButtonElement, component: HTMLElement): void;
	addDialog(button: HTMLButtonElement, component: HTMLElement): void;
};

type DockElements = {
	root: HTMLElement;
	tray: HTMLElement;
};

const setDialogHidden = (element: HTMLElement, hidden: boolean) => {
	element.classList.toggle("dialog--hidden", hidden);
	element.setAttribute("aria-hidden", hidden ? "true" : "false");
};

const setMenuHidden = (element: HTMLElement, hidden: boolean) => {
	element.classList.toggle("menu--hidden", hidden);
	element.setAttribute("aria-hidden", hidden ? "true" : "false");
};

const setButtonHidden = (button: HTMLButtonElement, hidden: boolean) => {
	button.classList.toggle("dock-button--hidden", hidden);
};

type HiddenHandler = (element: HTMLElement, hidden: boolean) => void;

const bindComponent = (
	button: HTMLButtonElement,
	component: HTMLElement,
	buttons: HTMLButtonElement[],
	setComponentHidden: HiddenHandler
) => {
	setComponentHidden(component, true);

	button.addEventListener("click", () => {
		setComponentHidden(component, false);
		buttons.forEach((dockButton) => {
			setButtonHidden(dockButton, true);
		});
	});

	component.addEventListener("dock:close", () => {
		setComponentHidden(component, true);
		buttons.forEach((dockButton) => {
			setButtonHidden(dockButton, false);
		});
	});
};

const parseDockTemplate = (templateHtml: string): DockElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const root = view.content.firstElementChild as HTMLElement | null;
	if (!root) {
		throw new Error("Dock template is missing a root element");
	}

	const tray = root.querySelector(".dock-tray") as HTMLElement | null;
	if (!tray) {
		throw new Error("Dock template is missing .dock-tray");
	}

	return { root, tray };
};

export function createDock(): Dock {
	const { root, tray } = parseDockTemplate(dockTemplate);
	document.body.appendChild(root);

	const buttons: HTMLButtonElement[] = [];

	const dock: Dock = {
		addMenu(button: HTMLButtonElement, component: HTMLElement) {
			root.appendChild(button);
			root.appendChild(component);
			buttons.push(button);
			bindComponent(button, component, buttons, setMenuHidden);
		},
		addDialog(button: HTMLButtonElement, component: HTMLElement) {
			tray.appendChild(button);
			document.body.appendChild(component);
			buttons.push(button);
			bindComponent(button, component, buttons, setDialogHidden);
		}
	};

	return dock;
}
