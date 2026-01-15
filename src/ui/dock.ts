import "../styles/dock.css";
import dockTemplate from "../templates/dock.html?raw";

type Dock = {
	addMenu(button: HTMLButtonElement, component: HTMLElement): void;
	addDialog(button: HTMLButtonElement, component: HTMLElement): void;
};

type DockElements = {
	root: HTMLElement;
	menuTray: HTMLElement;
	dialogTray: HTMLElement;
};

type HiddenHandler = (element: HTMLElement, hidden: boolean) => void;

export function createDock(): Dock {
	const { root, menuTray, dialogTray } = parseDockTemplate(dockTemplate);
	document.body.appendChild(root);

	const buttons: HTMLButtonElement[] = [];

	const dock: Dock = {
		addMenu(button: HTMLButtonElement, component: HTMLElement) {
			menuTray.appendChild(button);
			document.body.appendChild(component);
			buttons.push(button);
			bindComponent(button, component, buttons, setMenuHidden);
		},
		addDialog(button: HTMLButtonElement, component: HTMLElement) {
			dialogTray.appendChild(button);
			document.body.appendChild(component);
			buttons.push(button);
			bindComponent(button, component, buttons, setDialogHidden);
		}
	};

	return dock;
}

const parseDockTemplate = (templateHtml: string): DockElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const root = view.content.firstElementChild as HTMLElement | null;
	if (!root) {
		throw new Error("Dock template is missing a root element");
	}

	const menuTray = root.querySelector(".menu-tray") as HTMLElement | null;
	const dialogTray = root.querySelector(".dialog-tray") as HTMLElement | null;

	if (!menuTray || !dialogTray) {
		throw new Error("Dock template is missing required trays");
	}

	return { root, menuTray, dialogTray };
};

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

const setDialogHidden = (element: HTMLElement, hidden: boolean) => {
	element.classList.toggle("dialog--hidden", hidden);
	element.setAttribute("aria-hidden", hidden ? "true" : "false");
};

const setMenuHidden = (element: HTMLElement, hidden: boolean) => {
	element.classList.toggle("menu--hidden", hidden);
	element.setAttribute("aria-hidden", hidden ? "true" : "false");
};

const setButtonHidden = (button: HTMLButtonElement, hidden: boolean) => {
	button.classList.toggle("button--hidden", hidden);
};
